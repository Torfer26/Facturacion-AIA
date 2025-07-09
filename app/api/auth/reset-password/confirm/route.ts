import { NextRequest, NextResponse } from 'next/server';
import { resetTokenService } from '@/lib/services/resetTokenService';
import { updateUserPassword, findUserById } from '@/lib/auth/airtable-service';
import { z } from 'zod';

// Schema de validación para confirmación de reset
const confirmResetSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'La contraseña debe contener: mayúscula, minúscula, número y símbolo'),
  confirmPassword: z.string().min(1, 'Confirmación de contraseña requerida')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    // Validar datos del request
    const body = await request.json();
    const validatedData = confirmResetSchema.parse(body);

    console.log('[RESET CONFIRM] Procesando confirmación de reset');

    // Verificar el token de reset
    const tokenPayload = await resetTokenService.verifyResetToken(validatedData.token);

    if (!tokenPayload) {
      console.warn('[RESET CONFIRM] Token inválido o expirado');
      return NextResponse.json({
        success: false,
        error: 'El enlace de restablecimiento ha expirado o es inválido. Solicita uno nuevo.'
      }, { status: 400 });
    }

    // Verificar que el usuario aún existe y está activo
    const user = await findUserById(tokenPayload.userId);
    
    if (!user) {
      console.error('[RESET CONFIRM] Usuario no encontrado:', tokenPayload.userId);
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 });
    }

    if (!user.activo) {
      console.warn('[RESET CONFIRM] Usuario inactivo:', user.email);
      return NextResponse.json({
        success: false,
        error: 'La cuenta está desactivada'
      }, { status: 403 });
    }

    // Verificar que el email coincida
    if (user.email.toLowerCase() !== tokenPayload.email.toLowerCase()) {
      console.error('[RESET CONFIRM] Email mismatch in token');
      return NextResponse.json({
        success: false,
        error: 'Token inválido'
      }, { status: 400 });
    }

    try {
      // Actualizar la contraseña
      const updateSuccess = await updateUserPassword(user.id, validatedData.newPassword);

      if (!updateSuccess) {
        console.error('[RESET CONFIRM] Error al actualizar contraseña para:', user.email);
        return NextResponse.json({
          success: false,
          error: 'Error al actualizar la contraseña. Inténtalo de nuevo.'
        }, { status: 500 });
      }

      // Invalidar el token para evitar reutilización
      resetTokenService.invalidateToken(validatedData.token);

      console.log('[RESET CONFIRM] Contraseña actualizada exitosamente para:', user.email);

      return NextResponse.json({
        success: true,
        message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
      });

    } catch (updateError) {
      console.error('[RESET CONFIRM] Error en actualización de contraseña:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Error interno al actualizar la contraseña'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[RESET CONFIRM] Error general:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos inválidos',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// GET endpoint para verificar token sin cambiar contraseña
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token requerido'
      }, { status: 400 });
    }

    // Para verificación, crear método que no marque como usado
    // Necesitamos verificar manualmente sin consumir el token
    try {
      const { SignJWT, jwtVerify } = await import('jose');
      const secret = new TextEncoder().encode(process.env.JWT_SECRET + '-reset-salt');
      
      const { payload } = await jwtVerify(token, secret, {
        issuer: 'facturacion-aia-reset',
        audience: 'password-reset',
      });

      if (!payload.userId || !payload.email || payload.type !== 'password_reset') {
        throw new Error('Invalid token structure');
      }

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
      }

      // Verificar si ya fue usado
      if (resetTokenService.isTokenUsed(token)) {
        throw new Error('Token already used');
      }

      return NextResponse.json({
        success: true,
        valid: true,
        email: payload.email
      });

    } catch (verifyError) {
      return NextResponse.json({
        success: false,
        error: 'Token inválido o expirado'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      email: tokenPayload.email
    });

  } catch (error) {
    console.error('[RESET CONFIRM] Error verificando token:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
} 
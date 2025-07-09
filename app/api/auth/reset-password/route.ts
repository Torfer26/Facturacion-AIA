import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/auth/airtable-service';
import { resetTokenService } from '@/lib/services/resetTokenService';
import { emailService } from '@/lib/services/emailService';
import { z } from 'zod';

// Schema de validación para reset de contraseña
const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido')
});

export async function POST(request: NextRequest) {
  try {
    // Validar datos del request
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    console.log('[RESET PASSWORD] Solicitud para email:', validatedData.email);

    // Buscar usuario por email
    const user = await findUserByEmail(validatedData.email);
    
    // IMPORTANTE: Siempre devolver la misma respuesta por seguridad
    // No revelamos si el usuario existe o no
    const standardResponse = {
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones para restablecer tu contraseña en los próximos minutos.'
    };

    if (!user) {
      console.log('[RESET PASSWORD] Usuario no encontrado:', validatedData.email);
      return NextResponse.json(standardResponse);
    }

    if (!user.activo) {
      console.log('[RESET PASSWORD] Usuario inactivo:', validatedData.email);
      return NextResponse.json(standardResponse);
    }

    try {
      // Generar token seguro de reset
      const tokenData = await resetTokenService.generateResetToken(user.id, user.email);
      
      console.log('[RESET PASSWORD] Token seguro generado para:', validatedData.email);

      // Intentar enviar email con el token
      const emailSent = await emailService.sendPasswordResetEmail(user.email, tokenData.token);

      if (!emailSent) {
        console.error('[RESET PASSWORD] Error al enviar email para:', validatedData.email);
        
        // En desarrollo, loggear el token para testing y generar URL
        if (process.env.NODE_ENV === 'development') {
          const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password/confirm?token=${tokenData.token}`;
          
          console.log('='.repeat(80));
          console.log('🔐 EMAIL NO CONFIGURADO - TOKEN DE RESET GENERADO:');
          console.log(`👤 Usuario: ${user.email}`);
          console.log(`🔗 URL completa:`);
          console.log(`   ${resetUrl}`);
          console.log(`⏱️  Expira: ${tokenData.expiresAt.toLocaleString()}`);
          console.log('='.repeat(80));
          console.log('💡 CONFIGURAR EMAIL SMTP PARA PRODUCCIÓN');
          console.log('   Ver ENV_EJEMPLO.md para instrucciones');
          console.log('='.repeat(80));
        }
        
        // En desarrollo, incluir URL en respuesta para testing
        const responseData = {
          ...standardResponse,
          ...(process.env.NODE_ENV === 'development' && {
            dev_info: {
              email: user.email,
              message: '⚠️ Email no configurado. Ver consola del servidor para URL de reset.',
              reset_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password/confirm?token=${tokenData.token}`,
              expires_at: tokenData.expiresAt.toISOString()
            }
          })
        };
        
        return NextResponse.json(responseData);
      }

      console.log('[RESET PASSWORD] Email enviado exitosamente a:', validatedData.email);

      // En desarrollo, incluir información adicional para testing
      const responseData = {
        ...standardResponse,
        ...(process.env.NODE_ENV === 'development' && {
          dev_info: {
            email: user.email,
            token_generated: true,
            expires_at: tokenData.expiresAt.toISOString(),
            message: 'Token generado - verifica tu email'
          }
        })
      };

      return NextResponse.json(responseData);

    } catch (tokenError) {
      console.error('[RESET PASSWORD] Error generando token:', tokenError);
      
      // No revelar detalles del error interno
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor. Inténtalo de nuevo más tarde.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[RESET PASSWORD] Error general:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Email inválido',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updateUserPassword } from '@/lib/auth/airtable-service';
import { z } from 'zod';

// Schema de validación para reset de contraseña
const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido')
});

/**
 * Generar contraseña aleatoria segura
 */
function generateSecurePassword(): string {
  const length = 12;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '@$!%*?&';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Asegurar que tenga al menos uno de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Completar el resto de la longitud
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Mezclar la contraseña
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function POST(request: NextRequest) {
  try {
    // Validar datos del request
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    console.log('[RESET PASSWORD] Solicitud para email:', validatedData.email);

    // Buscar usuario por email
    const user = await findUserByEmail(validatedData.email);
    
    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no
      console.log('[RESET PASSWORD] Usuario no encontrado:', validatedData.email);
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    if (!user.activo) {
      console.log('[RESET PASSWORD] Usuario inactivo:', validatedData.email);
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    // Generar nueva contraseña temporal
    const newPassword = generateSecurePassword();
    console.log('[RESET PASSWORD] Nueva contraseña generada para:', validatedData.email);

    // Actualizar contraseña en la base de datos
    const success = await updateUserPassword(user.id, newPassword);

    if (!success) {
      console.error('[RESET PASSWORD] Error al actualizar contraseña para:', validatedData.email);
      return NextResponse.json({
        success: false,
        error: 'Error interno. Inténtalo de nuevo más tarde.'
      }, { status: 500 });
    }

    console.log('[RESET PASSWORD] Contraseña actualizada exitosamente para:', validatedData.email);

    // En un entorno de producción real, aquí enviarías un email
    // Por ahora, mostraremos la contraseña en la consola para desarrollo
    console.log('='.repeat(60));
    console.log('🔐 NUEVA CONTRASEÑA GENERADA:');
    console.log(`👤 Usuario: ${user.email}`);
    console.log(`🔑 Nueva contraseña: ${newPassword}`);
    console.log('⚠️  NOTA: En producción esto se enviaría por email');
    console.log('='.repeat(60));

    // Simular envío de email (en desarrollo solo registramos)
    try {
      // Aquí iría la lógica de envío de email
      // await sendPasswordResetEmail(user.email, newPassword);
      
      console.log('[RESET PASSWORD] Email "enviado" (simulado) a:', validatedData.email);
    } catch (emailError) {
      console.error('[RESET PASSWORD] Error simulando envío de email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
      // En desarrollo, incluimos la contraseña para testing
      ...(process.env.NODE_ENV === 'development' && {
        dev_info: {
          email: user.email,
          new_password: newPassword,
          message: 'Esta información solo se muestra en desarrollo'
        }
      })
    });

  } catch (error) {
    console.error('[RESET PASSWORD] Error:', error);
    
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
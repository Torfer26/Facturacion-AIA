import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { findUserById, updateUserPassword } from '@/lib/auth/airtable-service';
import { verifyPassword } from '@/lib/auth/password';
import { z } from 'zod';

// Schema de validación para cambio de contraseña
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'La contraseña debe contener: mayúscula, minúscula, número y símbolo'),
  confirmPassword: z.string().min(1, 'Confirmación de contraseña requerida')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.headers.get('Authorization')?.split(' ')[1] || 
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No autenticado'
      }, { status: 401 });
    }

    const userPayload = await verifyToken(token);
    if (!userPayload) {
      return NextResponse.json({
        success: false,
        error: 'Token inválido'
      }, { status: 401 });
    }

    // Validar datos del request
    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    console.log('[CHANGE PASSWORD] Usuario:', userPayload.email);

    // Obtener usuario actual de la base de datos
    const currentUser = await findUserById(userPayload.id);
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 });
    }

    // Verificar contraseña actual
    // Necesitamos obtener la contraseña hasheada de Airtable
    const Airtable = require('airtable');
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID!);
    
    const userRecord = await base(process.env.AIRTABLE_TABLE_USUARIOS || 'Usuarios')
      .find(userPayload.id);
    
    const storedPasswordHash = userRecord.get('Password');
    if (!storedPasswordHash) {
      return NextResponse.json({
        success: false,
        error: 'Error interno: contraseña no encontrada'
      }, { status: 500 });
    }

    // Verificar que la contraseña actual es correcta
    const isCurrentPasswordValid = await verifyPassword(
      validatedData.currentPassword, 
      storedPasswordHash
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'La contraseña actual es incorrecta'
      }, { status: 400 });
    }

    // Verificar que la nueva contraseña es diferente
    const isSamePassword = await verifyPassword(
      validatedData.newPassword, 
      storedPasswordHash
    );

    if (isSamePassword) {
      return NextResponse.json({
        success: false,
        error: 'La nueva contraseña debe ser diferente a la actual'
      }, { status: 400 });
    }

    // Actualizar contraseña
    const success = await updateUserPassword(userPayload.id, validatedData.newPassword);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Error al actualizar la contraseña'
      }, { status: 500 });
    }

    console.log('[CHANGE PASSWORD] Contraseña actualizada exitosamente para:', userPayload.email);

    return NextResponse.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('[CHANGE PASSWORD] Error:', error);
    
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
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { findUserById, updateUserPassword } from '@/lib/auth/airtable-service';
import { verifyPassword } from '@/lib/auth/password';
import { z } from 'zod';
import { 
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse 
} from '@/lib/utils/api-helpers';

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
      return createAuthErrorResponse('No autenticado');
    }

    const userPayload = await verifyToken(token);
    if (!userPayload) {
      return createAuthErrorResponse('Token inválido');
    }

    // Validar datos del request
    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    console.log('[CHANGE PASSWORD] Usuario:', userPayload.email);

    // Obtener usuario actual de la base de datos
    const currentUser = await findUserById(userPayload.id);
    if (!currentUser) {
      return createServerErrorResponse('Usuario no encontrado');
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
      return createServerErrorResponse('Error interno: contraseña no encontrada');
    }

    // Verificar que la contraseña actual es correcta
    const isCurrentPasswordValid = await verifyPassword(
      validatedData.currentPassword, 
      storedPasswordHash
    );

    if (!isCurrentPasswordValid) {
      return createServerErrorResponse('La contraseña actual es incorrecta');
    }

    // Verificar que la nueva contraseña es diferente
    const isSamePassword = await verifyPassword(
      validatedData.newPassword, 
      storedPasswordHash
    );

    if (isSamePassword) {
      return createServerErrorResponse('La nueva contraseña debe ser diferente a la actual');
    }

    // Actualizar contraseña
    const success = await updateUserPassword(userPayload.id, validatedData.newPassword);

    if (!success) {
      return createServerErrorResponse('Error al actualizar la contraseña');
    }

    console.log('[CHANGE PASSWORD] Contraseña actualizada exitosamente para:', userPayload.email);

    return createSuccessResponse({
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('[CHANGE PASSWORD] Error:', error);
    
    if (error instanceof z.ZodError) {
      return createServerErrorResponse('Datos inválidos: ' + JSON.stringify(error.errors));
    }

    return createServerErrorResponse('Error interno del servidor');
  }
} 
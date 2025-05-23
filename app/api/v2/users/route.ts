import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-v2/auth-service';
import { CreateUserSchema } from '@/lib/auth-v2/types';
import { authMiddleware, requireRole } from '@/lib/auth-v2/middleware';
import logger from '@/lib/logger/server';

// Crear nuevo usuario (solo ADMIN)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await authMiddleware(request);
    if (authResult.status !== 200) return authResult;
    
    // Verificar rol ADMIN
    const roleResult = requireRole(['ADMIN'])(request);
    if (roleResult.status !== 200) return roleResult;
    
    const body = await request.json();
    
    // Validar entrada
    const validatedInput = CreateUserSchema.parse(body);
    
    // Obtener usuario actual de los headers
    const currentUser = {
      id: request.headers.get('x-user-id')!,
      email: request.headers.get('x-user-email')!,
      role: request.headers.get('x-user-role')! as 'ADMIN',
      name: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Crear usuario
    const result = await AuthService.createUser(validatedInput, currentUser);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    logger.error('Create user API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { LoginSchema } from '@/lib/auth/types';
import { 
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse 
} from '@/lib/utils/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada con Zod
    const validatedInput = LoginSchema.parse(body);
    
    // Intentar login con el sistema V3
    const result = await AuthService.login(validatedInput);
    
    if (!result.success) {
      return createAuthErrorResponse(result.error || 'Credenciales inválidas');
    }
    
    // Login exitoso - configurar cookie y respuesta
    const response = createSuccessResponse({
      user: result.user,
      token: result.token
    });
    
    // Configurar cookie segura con el token
    response.cookies.set('auth-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Login API error:', error);
    
    // Error de validación de Zod
    if (error instanceof Error && error.message.includes('validation')) {
      return createServerErrorResponse('Datos de entrada inválidos');
    }
    
    return createServerErrorResponse('Error interno del servidor');
  }
}
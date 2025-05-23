import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-v2/auth-service';
import { LoginSchema } from '@/lib/auth-v2/types';
import logger from '@/lib/logger/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada
    const validatedInput = LoginSchema.parse(body);
    
    // Intentar login
    const result = await AuthService.login(validatedInput);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }
    
    // Login exitoso
    const response = NextResponse.json({
      success: true,
      user: result.user,
    });
    
    // Configurar cookie segura con el token
    response.cookies.set('auth-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    });
    
    return response;
  } catch (error) {
    logger.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
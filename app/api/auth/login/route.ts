import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { LoginSchema } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada con Zod
    const validatedInput = LoginSchema.parse(body);
    
    // Intentar login con el sistema V3
    const result = await AuthService.login(validatedInput);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Credenciales inválidas' 
        },
        { status: 401 }
      );
    }
    
    // Login exitoso - configurar cookie y respuesta
    const response = NextResponse.json({
      success: true,
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
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos de entrada inválidos' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
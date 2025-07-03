import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';

export async function GET(request: NextRequest) {
  try {
    // Obtener token de múltiples fuentes
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : 
                 request.headers.get('X-Auth-Token') || 
                 request.cookies.get('auth-token')?.value;
    
    // Sin token
    if (!token) {
      return NextResponse.json({ 
        success: false,
        authenticated: false, 
        error: 'No token provided' 
      });
    }
    
    // Verificar token con el sistema V3
    const user = await AuthService.verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        authenticated: false, 
        error: 'Invalid token' 
      });
    }
    
    // Token válido
    return NextResponse.json({ 
      success: true,
      authenticated: true, 
      user 
    });
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ 
      success: false,
      authenticated: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
} 
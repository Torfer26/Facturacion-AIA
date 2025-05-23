import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Test credentials
    if (email === 'admin@facturas.com' && password === 'Admin123@Facturas2024!') {
      const token = `test-token-${Date.now()}`;
      
      const response = NextResponse.json({
        success: true,
        token,
        user: {
          id: 'admin-1',
          email: 'admin@facturas.com',
          name: 'Administrador',
          role: 'admin'
        }
      });
      
      // Set cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax'
      });
      
      return response;
    }
    
    return NextResponse.json(
      { success: false, error: 'Credenciales inválidas' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
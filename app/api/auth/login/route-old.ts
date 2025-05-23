import { NextRequest, NextResponse } from 'next/server';

const TEST_EMAIL = 'admin@facturas.com';
const TEST_PASSWORD = 'Admin123@Facturas2024!';

// Force recompilation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // For testing: Accept test credentials
    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
      const token = `test-token-${Date.now()}`;
      
      // Create response with cookie
      const response = NextResponse.json({
        success: true,
        token,
        user: {
          id: 'admin-1',
          email: TEST_EMAIL,
          name: 'Administrador',
          role: 'admin'
        }
      });
      
      // Set cookie using response.cookies
      response.cookies.set({
        name: 'auth-token',
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax'
      });
      
      return response;
    }
    
    // Invalid credentials
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
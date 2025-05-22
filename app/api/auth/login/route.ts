import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const TEST_EMAIL = 'admin@facturas.com';
const TEST_PASSWORD = 'admin123';

export async function POST(request: NextRequest) {
  console.log('Login API called');
  
  try {
    const body = await request.json();
    const { email, password } = body;
    
    console.log('Login attempt for:', email);
    
    // For testing: Accept test credentials
    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
      const token = `test-token-${Date.now()}`;
      
      // Set cookie
      cookies().set({
        name: 'auth-token',
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax'
      });
      
      console.log('Login successful for test account');
      
      return NextResponse.json({
        success: true,
        token,
        user: {
          id: 'admin-1',
          email: TEST_EMAIL,
          name: 'Administrador',
          role: 'admin'
        }
      });
    }
    
    // Invalid credentials
    console.log('Login failed: Invalid credentials');
    return NextResponse.json(
      { success: false, error: 'Credenciales inválidas' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
} 
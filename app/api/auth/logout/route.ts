import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('[LOGOUT API] Processing logout request');
  
  try {
    // Crear respuesta exitosa
    const response = NextResponse.json({ success: true });
    
    // Limpiar cookie del servidor
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: -1, // Expira inmediatamente
      path: '/',
    });
    
    console.log('[LOGOUT API] Logout completed successfully');
    return response;
  } catch (error) {
    console.error('[LOGOUT API] Error during logout:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error during logout' 
    }, { status: 500 });
  }
} 
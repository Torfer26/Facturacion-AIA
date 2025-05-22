import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/api/auth/login'];

export async function middleware(request: NextRequest) {
  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Si es una ruta pública, permitir el acceso
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar si es una ruta de API
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  // Para rutas API, verificar el token en la cabecera
  if (isApiRoute) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
      
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    try {
      const user = await verifyToken(token);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Token inválido' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Error en middleware:', error);
      return NextResponse.json(
        { success: false, error: 'Error de autenticación' },
        { status: 500 }
      );
    }
  }
  
  // Para rutas de navegador, permitir el acceso y dejar que el cliente maneje la redirección
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Rutas API excepto auth
    '/api/:path*',
    // Excluir rutas de autenticación
    '/((?!api/auth/login|login|_next/static|_next/image|favicon.ico).*)',
  ],
}; 
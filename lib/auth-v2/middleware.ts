import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import logger from '@/lib/logger/server';

/**
 * Middleware de autenticación para rutas protegidas
 */
export async function authMiddleware(request: NextRequest) {
  try {
    // Obtener token del header Authorization
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      logger.warn(`Unauthorized access attempt to: ${request.nextUrl.pathname}`);
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    // Verificar token
    const user = await verifyToken(token);

    if (!user) {
      logger.warn(`Invalid token used for: ${request.nextUrl.pathname}`);
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Agregar usuario a los headers para uso en la API
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-role', user.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Error de autenticación' },
      { status: 500 }
    );
  }
}

/**
 * Verificar si el usuario tiene el rol requerido
 */
export function requireRole(allowedRoles: string[]) {
  return (request: NextRequest) => {
    const userRole = request.headers.get('x-user-role');
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      logger.warn(`Insufficient permissions. User role: ${userRole}, Required: ${allowedRoles.join(', ')}`);
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }
    
    return NextResponse.next();
  };
}
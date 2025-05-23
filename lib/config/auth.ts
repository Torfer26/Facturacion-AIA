/**
 * Configuración del sistema de autenticación
 */

export const AUTH_CONFIG = {
  // Feature flag para activar/desactivar nueva autenticación
  ENABLE_NEW_AUTH: process.env.ENABLE_NEW_AUTH === 'true',
  
  // Configuración JWT
  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES_IN: '7d',
    ISSUER: 'facturacion-aia',
    AUDIENCE: 'facturacion-aia-users',
  },
  
  // Configuración de cookies
  COOKIE: {
    NAME: 'auth-token',
    MAX_AGE: 7 * 24 * 60 * 60, // 7 días en segundos
    HTTP_ONLY: true,
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: 'strict' as const,
  },
  
  // Configuración de contraseñas
  PASSWORD: {
    MIN_LENGTH: 8,
    SALT_ROUNDS: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: true,
  },
  
  // Roles y permisos
  ROLES: {
    ADMIN: 'ADMIN',
    USER: 'USER',
    VIEWER: 'VIEWER',
  } as const,
  
  // Rutas protegidas
  PROTECTED_ROUTES: [
    '/dashboard',
    '/facturas',
    '/api/facturas',
    '/api/users',
  ],  
  // Rutas públicas (no requieren autenticación)
  PUBLIC_ROUTES: [
    '/login',
    '/api/auth/login',
    '/api/auth/logout',
  ],
  
  // Rutas que requieren rol ADMIN
  ADMIN_ROUTES: [
    '/admin',
    '/api/users',
    '/api/admin',
  ],
};

/**
 * Verificar si una ruta está protegida
 */
export function isProtectedRoute(pathname: string): boolean {
  return AUTH_CONFIG.PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
}

/**
 * Verificar si una ruta es pública
 */
export function isPublicRoute(pathname: string): boolean {
  return AUTH_CONFIG.PUBLIC_ROUTES.some(route => 
    pathname.startsWith(route)
  );
}

/**
 * Verificar si una ruta requiere rol ADMIN
 */
export function requiresAdminRole(pathname: string): boolean {
  return AUTH_CONFIG.ADMIN_ROUTES.some(route => 
    pathname.startsWith(route)
  );
}
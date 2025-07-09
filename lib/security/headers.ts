import { NextResponse } from 'next/server';

interface SecurityHeaders {
  [key: string]: string;
}

/**
 * Headers de seguridad para producción
 */
export const SECURITY_HEADERS: SecurityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://js.sentry-cdn.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.airtable.com https://sentry.io https://o4504609814904832.ingest.sentry.io",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'"
  ].join('; '),

  // Prevenir ataques XSS
  'X-XSS-Protection': '1; mode=block',

  // Prevenir MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Controlar como se puede embebir la página
  'X-Frame-Options': 'DENY',

  // HSTS - Forzar HTTPS (solo en producción)
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  }),

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy (antes Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()'
  ].join(', '),

  // Prevenir información del servidor
  'X-Powered-By': 'FacturacionAIA',

  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'unsafe-none',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

/**
 * Headers específicos para APIs
 */
export const API_SECURITY_HEADERS: SecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Resource-Policy': 'same-origin',
  
  // No cache para APIs sensibles
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
};

/**
 * Headers específicos para autenticación
 */
export const AUTH_SECURITY_HEADERS: SecurityHeaders = {
  ...API_SECURITY_HEADERS,
  
  // Headers adicionales para endpoints de auth
  'X-Robots-Tag': 'noindex, nofollow, nosnippet, noarchive',
  'X-Permitted-Cross-Domain-Policies': 'none',
  
  // Prevenir cache más agresivamente
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '-1'
};

/**
 * Aplicar headers de seguridad a una respuesta
 */
export function applySecurityHeaders(
  response: NextResponse, 
  type: 'page' | 'api' | 'auth' = 'page'
): NextResponse {
  let headers: SecurityHeaders;

  switch (type) {
    case 'auth':
      headers = AUTH_SECURITY_HEADERS;
      break;
    case 'api':
      headers = API_SECURITY_HEADERS;
      break;
    default:
      headers = SECURITY_HEADERS;
  }

  // Aplicar headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Header de versión para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-App-Version', 'dev');
    response.headers.set('X-Security-Headers', 'applied');
  }

  return response;
}

/**
 * Verificar si el origen está permitido
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Permitir requests sin origen (same-origin)

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  // En desarrollo, permitir localhost
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }

  return allowedOrigins.some(allowed => 
    allowed.trim() === origin || origin.endsWith(allowed.trim())
  );
}

/**
 * Configurar CORS headers
 */
export function applyCorsHeaders(
  response: NextResponse, 
  origin: string | null
): NextResponse {
  if (isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set(
      'Access-Control-Allow-Methods', 
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-Auth-Token'
    );
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

/**
 * Headers para archivos estáticos
 */
export const STATIC_FILE_HEADERS: SecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  
  // Cache más agresivo para archivos estáticos
  'Cache-Control': 'public, max-age=31536000, immutable'
}; 
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';
import { applySecurityHeaders, applyCorsHeaders } from './lib/security/headers';
import { rateLimiter } from './lib/security/rateLimiter';

// List of paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/test-auth',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/check',
  '/api/auth/reset-password',
  '/auth/reset-password',
  '/_next',
  '/favicon.ico',
  '/.well-known',
];

// Pre-compile regex patterns for better performance
const staticFileRegex = /\.(jpg|jpeg|png|gif|svg|css|js|ico|woff|woff2|ttf|eot)$/i;
const nextStaticRegex = /\/_next\//;
const wellKnownRegex = /\/\.well-known\//;

// Check if a path matches any of the public paths
const isPublicPath = (path: string): boolean => {
  // Fast checks first
  if (staticFileRegex.test(path) || nextStaticRegex.test(path) || wellKnownRegex.test(path)) {
    return true;
  }
  
  // Check exact matches and prefixes
  return publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MIDDLEWARE] ${pathname}`);
  }
  
  // Rate limiting para todas las APIs
  if (pathname.startsWith('/api/')) {
    const limitCheck = rateLimiter.checkLimit(request);
    
    if (!limitCheck.allowed) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[MIDDLEWARE] Rate limit exceeded: ${pathname}`);
      }
      
      const response = NextResponse.json({
        success: false,
        error: limitCheck.message || 'Demasiadas peticiones'
      }, { status: 429 });
      
      // Añadir headers informativos sobre rate limiting
      response.headers.set('X-RateLimit-Limit', '60');
      response.headers.set('X-RateLimit-Remaining', '0');
      if (limitCheck.resetTime) {
        response.headers.set('X-RateLimit-Reset', Math.ceil(limitCheck.resetTime / 1000).toString());
        response.headers.set('Retry-After', Math.ceil((limitCheck.resetTime - Date.now()) / 1000).toString());
      }
      
      // Aplicar headers de seguridad al response de rate limit
      const secureResponse = applySecurityHeaders(response, 'api');
      return applyCorsHeaders(secureResponse, request.headers.get('origin'));
    }
  }
  
  // Allow access to public paths
  if (isPublicPath(pathname)) {
    const response = NextResponse.next();
    
    // Aplicar headers de seguridad según el tipo de ruta
    const headerType = pathname.startsWith('/api/auth/') ? 'auth' : 
                      pathname.startsWith('/api/') ? 'api' : 'page';
    
    const secureResponse = applySecurityHeaders(response, headerType);
    return applyCorsHeaders(secureResponse, request.headers.get('origin'));
  }
  
  // Get token from Authorization header or from the cookie
  const token = request.headers.get('Authorization')?.split(' ')[1] || 
                request.cookies.get('auth-token')?.value;
  
  // If there's no token and this is an API route, return 401
  if (!token && pathname.startsWith('/api/')) {
    const response = NextResponse.json(
      { success: false, error: 'Unauthorized' }, 
      { status: 401 }
    );
    
    const secureResponse = applySecurityHeaders(response, 'auth');
    return applyCorsHeaders(secureResponse, request.headers.get('origin'));
  }
  
  // If there's no token and this is a page route, redirect to login
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  try {
    // Verify token
    const user = await verifyToken(token);
    
    // If invalid token and this is an API route, return 401
    if (!user && pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' }, 
        { status: 401 }
      );
    }
    
    // If invalid token and this is a page route, redirect to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // Valid token, allow the request and add user to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-rol', user.rol);
    
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    // Aplicar headers de seguridad
    const headerType = pathname.startsWith('/api/auth/') ? 'auth' : 
                      pathname.startsWith('/api/') ? 'api' : 'page';
    
    const secureResponse = applySecurityHeaders(response, headerType);
    return applyCorsHeaders(secureResponse, request.headers.get('origin'));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[MIDDLEWARE] Error processing token:', error);
    }
    
    // Error processing token, redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Server error' }, 
        { status: 500 }
      );
    }
    
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    // Matches all paths except public assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 
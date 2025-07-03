import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';
import { AntiSpam } from './lib/local/anti-spam';

// List of paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/test-auth',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/check',
  '/_next',
  '/favicon.ico',
  '/.well-known',
];

// Check if a path matches any of the public paths
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(`${publicPath}/`) ||
    path.match(/\.(jpg|png|svg|css|js)$/i) ||
    path.includes('_next') ||
    path.includes('.well-known')
  );
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[MIDDLEWARE V3] Checking path: ${pathname}`);
  
  // Anti-spam para APIs sensibles (solo en desarrollo)
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/dev/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const verificacion = AntiSpam.verificar(ip, pathname);
    
    if (!verificacion.permitido) {
      console.log(`[MIDDLEWARE V3] Anti-spam bloqueado: ${pathname} desde ${ip}`);
      return NextResponse.json({
        success: false,
        error: verificacion.mensaje || 'Demasiadas peticiones'
      }, { status: 429 });
    }
  }
  
  // Allow access to public paths
  if (isPublicPath(pathname)) {
    console.log(`[MIDDLEWARE V3] Public path allowed: ${pathname}`);
    return NextResponse.next();
  }
  
  console.log(`[MIDDLEWARE V3] Protected path, checking auth: ${pathname}`);
  
  // Get token from Authorization header or from the cookie
  const token = request.headers.get('Authorization')?.split(' ')[1] || 
                request.cookies.get('auth-token')?.value;
  
  console.log(`[MIDDLEWARE V3] Token present: ${!!token}`);
  
  // If there's no token and this is an API route, return 401
  if (!token && pathname.startsWith('/api/')) {
    console.log(`[MIDDLEWARE V3] API route with no token, returning 401`);
    return NextResponse.json(
      { success: false, error: 'Unauthorized' }, 
      { status: 401 }
    );
  }
  
  // If there's no token and this is a page route, redirect to login
  if (!token) {
    console.log(`[MIDDLEWARE V3] Page route with no token, redirecting to login`);
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  try {
    // Verify token with V3 system
    const user = await verifyToken(token);
    
    console.log(`[MIDDLEWARE V3] Token verification result: ${!!user}`);
    
    // If invalid token and this is an API route, return 401
    if (!user && pathname.startsWith('/api/')) {
      console.log(`[MIDDLEWARE V3] API route with invalid token, returning 401`);
      return NextResponse.json(
        { success: false, error: 'Invalid token' }, 
        { status: 401 }
      );
    }
    
    // If invalid token and this is a page route, redirect to login
    if (!user) {
      console.log(`[MIDDLEWARE V3] Page route with invalid token, redirecting to login`);
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // Valid token, allow the request and add user to headers
    console.log(`[MIDDLEWARE V3] Valid token, allowing access for user: ${user.email}`);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-rol', user.rol);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('[MIDDLEWARE V3] Error processing token:', error);
    
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
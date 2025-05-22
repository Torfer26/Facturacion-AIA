import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// List of paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
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
  
  console.log('Middleware - checking path:', pathname);
  
  // Allow access to public paths
  if (isPublicPath(pathname)) {
    console.log('Middleware - public path, allowing access');
    return NextResponse.next();
  }
  
  console.log('Middleware - protected path, checking auth');
  
  // Get token from Authorization header or from the cookie
  const token = request.headers.get('Authorization')?.split(' ')[1] || 
                request.cookies.get('auth-token')?.value;
  
  // Also check localStorage via a custom header that might be set by the client
  const authHeader = request.headers.get('X-Auth-Token');
  const finalToken = token || authHeader;
  
  console.log('Middleware - token exists:', !!finalToken);
  
  // If there's no token and this is an API route, return 401
  if (!finalToken && pathname.startsWith('/api/')) {
    console.log('Middleware - API route with no token, returning 401');
    return NextResponse.json(
      { success: false, error: 'Unauthorized' }, 
      { status: 401 }
    );
  }
  
  // If there's no token and this is a page route, redirect to login
  if (!finalToken) {
    console.log('Middleware - page route with no token, redirecting to login');
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  try {
    // Verify token validity
    const user = await verifyToken(finalToken);
    console.log('Middleware - token verification result:', !!user);
    
    // If invalid token and this is an API route, return 401
    if (!user && pathname.startsWith('/api/')) {
      console.log('Middleware - API route with invalid token, returning 401');
      return NextResponse.json(
        { success: false, error: 'Invalid token' }, 
        { status: 401 }
      );
    }
    
    // If invalid token and this is a page route, redirect to login
    if (!user) {
      console.log('Middleware - page route with invalid token, redirecting to login');
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // Valid token, allow the request and add user to headers
    console.log('Middleware - valid token, allowing access');
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware - error processing token:', error);
    
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
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { 
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse 
} from '@/lib/utils/api-helpers';

export async function GET(request: NextRequest) {
  try {
    // Obtener token de múltiples fuentes
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : 
                 request.headers.get('X-Auth-Token') || 
                 request.cookies.get('auth-token')?.value;
    
    // Sin token
    if (!token) {
      return createAuthErrorResponse('No token provided');
    }
    
    // Verificar token con el sistema V3
    const user = await AuthService.verifyToken(token);
    
    if (!user) {
      return createAuthErrorResponse('Invalid token');
    }
    
    // Token válido
    return createSuccessResponse({ 
      authenticated: true, 
      user 
    });
    
  } catch (error) {
    console.error('Auth check error:', error);
    return createServerErrorResponse('Server error');
  }
} 
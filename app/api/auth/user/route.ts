import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { 
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse 
} from '@/lib/utils/api-helpers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return createAuthErrorResponse('No autenticado');
    }

    const user = await verifyToken(token);

    if (!user) {
      return createAuthErrorResponse('Token inválido');
    }

    return createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.nombre,
        role: user.rol
      }
    });
  } catch (error) {
    return createServerErrorResponse('Error interno del servidor');
  }
} 
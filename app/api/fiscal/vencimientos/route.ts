import { NextResponse } from 'next/server'
import { getVencimientosFiscales } from '@/lib/services/airtable-fiscal'
import { verifyToken } from '@/lib/auth'
import { 
  getNormalizedTimestamp, 
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
  checkAuth
} from '@/lib/utils/api-helpers'

export async function GET(request: Request) {
  try {
    // Check authentication
    const auth = await checkAuth(request);
    if (!auth.authenticated) {
      return createAuthErrorResponse(auth.error);
    }

    const vencimientos = await getVencimientosFiscales();

    return createSuccessResponse(
      { vencimientos },
      { count: vencimientos.length }
    );
  } catch (error) {
    console.error('Error getting vencimientos fiscales:', error);
    return createServerErrorResponse(
      error instanceof Error ? error.message : 'Error desconocido al obtener los vencimientos fiscales'
    );
  }
} 
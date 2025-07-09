/**
 * Utilidades compartidas para las APIs
 * Centraliza funciones comunes para evitar duplicación
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Helper function to ensure date is current year
export function getNormalizedTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

// Verificar que todas las variables de entorno necesarias estén definidas
export function validateEnvVars(requiredVars: Record<string, string | undefined>): string[] {
  return Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
}

// Response estándar para variables de entorno faltantes
export function createEnvErrorResponse(missingVars: string[]) {
  return NextResponse.json({
    success: false,
    error: `Missing required environment variables: ${missingVars.join(', ')}`,
    timestamp: getNormalizedTimestamp()
  }, { status: 500 });
}

// Response estándar para errores de autenticación
export function createAuthErrorResponse(error: string) {
  return NextResponse.json({
    success: false,
    error
  }, { status: 401 });
}

// Response estándar para errores del servidor
export function createServerErrorResponse(error: string | Error) {
  const errorMessage = error instanceof Error ? error.message : error;
  return NextResponse.json({
    success: false,
    error: errorMessage,
    timestamp: getNormalizedTimestamp()
  }, { status: 500 });
}

// Response estándar para éxito
export function createSuccessResponse(data: any, metadata?: any) {
  return NextResponse.json({
    success: true,
    ...data,
    ...(metadata && { metadata: { ...metadata, timestamp: getNormalizedTimestamp() } })
  });
}

// Check authentication helper (UNIFICADO)
export async function checkAuth(request: Request): Promise<
  | { authenticated: true; user: any }
  | { authenticated: false; error: string }
> {
  // Get token from cookies (same as middleware)
  const cookieHeader = request.headers.get('cookie') || '';
  
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const [name, value] = cookie.trim().split('=');
      return [name, value];
    })
  );
  
  const token = cookies['auth-token'];
  
  if (!token) {
    return { authenticated: false, error: 'No authentication token provided' };
  }
  
  // Try to verify token with both systems
  let user = await verifyToken(token); // V1 system
  
  if (!user) {
    // Try V2 system (JWT)
    try {
      const jwtUser = await verifyToken(token);
      if (jwtUser) {
        user = {
          id: jwtUser.id,
          email: jwtUser.email,
          name: jwtUser.name || jwtUser.email, // Use name or email as fallback
          role: jwtUser.role.toLowerCase()
        };
      }
    } catch (error) {
      // JWT verification failed, user remains null
    }
  }
  
  if (!user) {
    return { authenticated: false, error: 'Invalid authentication token' };
  }
  
  return { authenticated: true, user };
}

// Validación estándar de variables de entorno para Airtable
export const AIRTABLE_ENV_VARS = {
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  AIRTABLE_API_URL: process.env.AIRTABLE_API_URL
};

// Validación estándar para APIs de Airtable
export function validateAirtableEnv(): { valid: boolean; response: NextResponse | null } {
  const missingVars = validateEnvVars(AIRTABLE_ENV_VARS);
  if (missingVars.length > 0) {
    return { valid: false, response: createEnvErrorResponse(missingVars) };
  }
  return { valid: true, response: null };
} 
import { jwtVerify } from 'jose';
import { SafeUser } from './types';

// Obtener la clave secreta de forma segura
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Verificar un token JWT (versión Edge Runtime compatible)
 */
export async function verifyToken(token: string): Promise<SafeUser | null> {
  try {
    const secret = getJwtSecret();
    
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'facturacion-aia',
      audience: 'facturacion-aia-users',
    });
    
    // Validar que el payload tenga los campos necesarios
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      return null;
    }
    
    return {
      id: payload.userId,
      email: payload.email,
      name: payload.email, // Usar email como nombre por defecto
      role: payload.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    // No usar logger aquí para compatibilidad con Edge Runtime
    return null;
  }
}
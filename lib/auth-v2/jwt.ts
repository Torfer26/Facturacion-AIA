import { SignJWT, jwtVerify } from 'jose';
import { SafeUser } from './types';
import logger from '@/lib/logger/server';

// Obtener la clave secreta de forma segura
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Crear un token JWT seguro
 */
export async function createToken(user: SafeUser): Promise<string> {
  try {
    const secret = getJwtSecret();
    
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // 7 días
      .setIssuer('facturacion-aia')
      .setAudience('facturacion-aia-users')
      .sign(secret);
    
    return token;
  } catch (error) {
    logger.error('Error creating JWT token:', error);
    throw new Error('Error al crear el token de autenticación');
  }
}/**
 * Verificar un token JWT
 */
export async function verifyToken(token: string): Promise<SafeUser | null> {
  try {
    const secret = getJwtSecret();
    
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'facturacion-aia',
      audience: 'facturacion-aia-users',
    });
    
    // Validar que el payload tenga los campos necesarios
    if (!payload.userId || !payload.email || !payload.role) {
      logger.warn('Invalid JWT payload structure');
      return null;
    }
    
    return {
      id: payload.userId as string,
      email: payload.email as string,
      name: '', // Se obtendrá de la base de datos si es necesario
      role: payload.role as 'ADMIN' | 'USER' | 'VIEWER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    logger.warn('Invalid JWT token:', error);
    return null;
  }
}
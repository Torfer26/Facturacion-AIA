import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload, SafeUser } from './types';

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
    
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      rol: user.rol,
    };
    
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // 7 días
      .setIssuer('facturacion-aia')
      .setAudience('facturacion-aia-users')
      .sign(secret);
    
    return token;
  } catch (error) {
    console.error('Error creating JWT token:', error);
    throw new Error('Error al crear el token de autenticación');
  }
}

/**
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
    if (!payload.userId || !payload.email || !payload.rol) {
      console.warn('Invalid JWT payload structure');
      return null;
    }
    
    return {
      id: payload.userId as string,
      email: payload.email as string,
      nombre: '', // Se obtendrá de Airtable si es necesario
      rol: payload.rol as 'ADMIN' | 'USER' | 'VIEWER',
      activo: true,
      fechaCreacion: new Date(),
      ultimaConexion: new Date(),
    };
  } catch (error) {
    console.warn('Invalid JWT token:', error);
    return null;
  }
}

/**
 * Obtener payload sin verificar (solo para debugging)
 */
export function decodeTokenUnsafe(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    return null;
  }
} 
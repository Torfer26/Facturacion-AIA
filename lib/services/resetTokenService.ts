import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

interface ResetTokenPayload {
  userId: string;
  email: string;
  type: 'password_reset';
  iat: number;
  exp: number;
}

interface ResetTokenData {
  token: string;
  expiresAt: Date;
}

class ResetTokenService {
  private readonly SECRET_KEY: Uint8Array;
  private readonly TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutos
  private readonly ISSUER = 'facturacion-aia-reset';
  
  // Cache en memoria para tokens usados (en producción usar Redis)
  private usedTokens = new Set<string>();

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET debe tener al menos 32 caracteres para tokens de reset');
    }
    this.SECRET_KEY = new TextEncoder().encode(secret + '-reset-salt');
  }

  /**
   * Generar token seguro para reset de contraseña
   */
  async generateResetToken(userId: string, email: string): Promise<ResetTokenData> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + Math.floor(this.TOKEN_EXPIRY / 1000);

    // Generar un nonce único para evitar reutilización
    const nonce = crypto.randomBytes(16).toString('hex');

    const payload: ResetTokenPayload = {
      userId,
      email: email.toLowerCase(),
      type: 'password_reset',
      iat: now,
      exp,
    };

    try {
      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now)
        .setExpirationTime(exp)
        .setIssuer(this.ISSUER)
        .setAudience('password-reset')
        .setJti(nonce) // Añadir nonce como JTI
        .sign(this.SECRET_KEY);

      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY);

      console.log(`✅ Reset token generated for user: ${email}`);
      
      return {
        token,
        expiresAt,
      };
    } catch (error) {
      console.error('❌ Error generating reset token:', error);
      throw new Error('Failed to generate reset token');
    }
  }

  /**
   * Verificar y validar token de reset
   */
  async verifyResetToken(token: string): Promise<ResetTokenPayload | null> {
    try {
      // Verificar si el token ya fue usado
      if (this.usedTokens.has(token)) {
        console.warn('⚠️ Attempted to reuse a reset token');
        return null;
      }

      const { payload } = await jwtVerify(token, this.SECRET_KEY, {
        issuer: this.ISSUER,
        audience: 'password-reset',
      });

      // Validar estructura del payload
      if (!payload.userId || !payload.email || payload.type !== 'password_reset') {
        console.warn('⚠️ Invalid reset token payload structure');
        return null;
      }

      // Verificar que no haya expirado
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.warn('⚠️ Reset token has expired');
        return null;
      }

      // Marcar token como usado
      this.usedTokens.add(token);
      
      // Limpiar tokens antiguos periódicamente
      this.cleanupUsedTokens();

      console.log(`✅ Reset token verified for user: ${payload.email}`);

      return {
        userId: payload.userId as string,
        email: payload.email as string,
        type: payload.type as 'password_reset',
        iat: payload.iat as number,
        exp: payload.exp as number,
      };
    } catch (error) {
      console.warn('⚠️ Invalid reset token:', error.message);
      return null;
    }
  }

  /**
   * Invalidar token específico
   */
  invalidateToken(token: string): void {
    this.usedTokens.add(token);
    console.log('🗑️ Reset token invalidated');
  }

  /**
   * Limpiar tokens usados antiguos
   */
  private cleanupUsedTokens(): void {
    // Solo mantener los últimos 1000 tokens para evitar crecimiento infinito
    if (this.usedTokens.size > 1000) {
      const tokensArray = Array.from(this.usedTokens);
      // Remover los primeros 500 (más antiguos)
      for (let i = 0; i < 500; i++) {
        this.usedTokens.delete(tokensArray[i]);
      }
    }
  }

  /**
   * Verificar si un token está en la lista de usados
   */
  isTokenUsed(token: string): boolean {
    return this.usedTokens.has(token);
  }

  /**
   * Obtener estadísticas del servicio
   */
  getStats() {
    return {
      usedTokensCount: this.usedTokens.size,
      tokenExpiryMinutes: this.TOKEN_EXPIRY / (60 * 1000),
    };
  }
}

// Singleton instance
export const resetTokenService = new ResetTokenService();
export default ResetTokenService; 
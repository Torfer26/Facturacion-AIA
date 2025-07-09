import { NextRequest } from 'next/server';

interface RateLimit {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitRule {
  windowMs: number;    // Ventana de tiempo en ms
  maxRequests: number; // Máximo de requests permitidos
  message?: string;    // Mensaje personalizado
}

// Configuración de límites más estrictos para producción
const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  // Endpoints críticos de autenticación
  '/api/auth/login': {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,            // 5 intentos max
    message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'
  },
  
  '/api/auth/reset-password': {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3,            // 3 intentos max
    message: 'Demasiadas solicitudes de reset. Intenta de nuevo en 1 hora.'
  },
  
  '/api/auth/reset-password/confirm': {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10,           // 10 intentos max
    message: 'Demasiados intentos de confirmación. Intenta de nuevo en 1 hora.'
  },
  
  '/api/auth/change-password': {
    windowMs: 30 * 60 * 1000, // 30 minutos
    maxRequests: 5,            // 5 intentos max
    message: 'Demasiados cambios de contraseña. Intenta de nuevo en 30 minutos.'
  },
  
  // APIs de facturación
  '/api/facturas/upload': {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 50,           // 50 uploads max
    message: 'Límite de uploads alcanzado. Intenta de nuevo en 1 hora.'
  },
  
  // Límite general para APIs
  '/api/': {
    windowMs: 60 * 1000,      // 1 minuto
    maxRequests: 100,         // 100 requests por minuto
    message: 'Demasiadas peticiones. Intenta de nuevo en un minuto.'
  }
};

class RateLimiter {
  private cache = new Map<string, RateLimit>();
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    // Limpiar cache cada 5 minutos (solo en servidor)
    if (typeof window === 'undefined' && typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Obtener IP del request de forma segura
   */
  private getIP(request: NextRequest): string {
    // Priorizar headers de proxy/load balancer
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
    
    // Si hay múltiples IPs en x-forwarded-for, tomar la primera (cliente original)
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    return realIP || cfConnectingIP || request.ip || 'unknown';
  }

  /**
   * Obtener regla de rate limit para una ruta
   */
  private getRule(pathname: string): RateLimitRule {
    // Buscar regla específica (más específica primero)
    for (const [pattern, rule] of Object.entries(RATE_LIMIT_RULES)) {
      if (pathname.startsWith(pattern)) {
        return rule;
      }
    }
    
    // Regla por defecto si no se encuentra ninguna
    return {
      windowMs: 60 * 1000,  // 1 minuto
      maxRequests: 60,      // 60 requests por minuto
      message: 'Demasiadas peticiones'
    };
  }

  /**
   * Verificar si un request está permitido
   */
  checkLimit(request: NextRequest): { 
    allowed: boolean; 
    message?: string; 
    resetTime?: number;
    remaining?: number;
  } {
    const ip = this.getIP(request);
    const pathname = new URL(request.url).pathname;
    const rule = this.getRule(pathname);
    
    const key = `${ip}:${pathname}`;
    const now = Date.now();
    
    let limitData = this.cache.get(key);
    
    // Si no existe o la ventana ha expirado, crear nueva entrada
    if (!limitData || (now - limitData.firstRequest) > rule.windowMs) {
      limitData = {
        count: 1,
        resetTime: now + rule.windowMs,
        firstRequest: now
      };
      this.cache.set(key, limitData);
      
      return {
        allowed: true,
        remaining: rule.maxRequests - 1,
        resetTime: limitData.resetTime
      };
    }
    
    // Incrementar contador
    limitData.count++;
    this.cache.set(key, limitData);
    
    // Verificar si excede el límite
    if (limitData.count > rule.maxRequests) {
      const resetInSeconds = Math.ceil((limitData.resetTime - now) / 1000);
      
      console.warn(`[RATE LIMIT] IP ${ip} excedió límite en ${pathname}: ${limitData.count}/${rule.maxRequests}`);
      
      return {
        allowed: false,
        message: rule.message || `Demasiadas peticiones. Intenta de nuevo en ${resetInSeconds} segundos.`,
        resetTime: limitData.resetTime,
        remaining: 0
      };
    }
    
    return {
      allowed: true,
      remaining: rule.maxRequests - limitData.count,
      resetTime: limitData.resetTime
    };
  }

  /**
   * Limpiar entradas expiradas del cache
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, data] of this.cache.entries()) {
      if (now > data.resetTime) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`[RATE LIMITER] Limpiadas ${cleanedCount} entradas expiradas`);
    }
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats() {
    const now = Date.now();
    const activeEntries = Array.from(this.cache.entries()).filter(
      ([_, data]) => now <= data.resetTime
    );
    
    return {
      totalEntries: this.cache.size,
      activeEntries: activeEntries.length,
      expiredEntries: this.cache.size - activeEntries.length,
      topIPs: this.getTopIPs()
    };
  }

  /**
   * Obtener IPs con más requests
   */
  private getTopIPs(): Array<{ ip: string; requests: number; endpoints: number }> {
    const ipStats = new Map<string, { requests: number; endpoints: Set<string> }>();
    
    for (const [key, data] of this.cache.entries()) {
      const [ip, endpoint] = key.split(':');
      
      if (!ipStats.has(ip)) {
        ipStats.set(ip, { requests: 0, endpoints: new Set() });
      }
      
      const stats = ipStats.get(ip)!;
      stats.requests += data.count;
      stats.endpoints.add(endpoint);
    }
    
    return Array.from(ipStats.entries())
      .map(([ip, stats]) => ({
        ip,
        requests: stats.requests,
        endpoints: stats.endpoints.size
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);
  }

  /**
   * Resetear límites para una IP específica (para admin)
   */
  resetIP(ip: string): number {
    let resetCount = 0;
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${ip}:`)) {
        this.cache.delete(key);
        resetCount++;
      }
    }
    
    console.log(`[RATE LIMITER] Reset ${resetCount} entradas para IP: ${ip}`);
    return resetCount;
  }

  /**
   * Destructor para limpiar interval
   */
  destroy(): void {
    if (this.cleanupInterval && typeof clearInterval !== 'undefined') {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined as any;
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Cleanup on process exit (solo en servidor)
if (typeof process !== 'undefined' && process.on) {
  process.on('SIGTERM', () => rateLimiter.destroy());
  process.on('SIGINT', () => rateLimiter.destroy());
}

export default RateLimiter; 
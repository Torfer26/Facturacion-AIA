/**
 * Sistema anti-spam simple para desarrollo local
 */

interface RequestLog {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

// Cache simple en memoria para desarrollo
const requestCache = new Map<string, RequestLog>();

export class AntiSpam {
  private static readonly LIMITES = {
    '/api/auth/login': { max: 10, ventana: 5 * 60 * 1000 }, // 10 intentos en 5 min
    '/api/auth/register': { max: 3, ventana: 10 * 60 * 1000 }, // 3 en 10 min
    '/api/facturas/upload': { max: 20, ventana: 60 * 60 * 1000 }, // 20 en 1 hora
    'default': { max: 100, ventana: 60 * 1000 } // 100 por minuto general
  };

  /**
   * Verificar si una IP puede hacer una petición
   */
  static verificar(ip: string, ruta: string): { permitido: boolean; mensaje?: string } {
    const ahora = Date.now();
    const clave = `${ip}:${ruta}`;
    
    // Buscar límite específico o usar default
    const limite = this.LIMITES[ruta as keyof typeof this.LIMITES] || this.LIMITES.default;
    
    // Obtener o crear log de requests
    let log = requestCache.get(clave);
    
    if (!log) {
      log = { count: 0, firstRequest: ahora, lastRequest: ahora };
    }
    
    // Si ha pasado la ventana de tiempo, resetear contador
    if (ahora - log.firstRequest > limite.ventana) {
      log = { count: 0, firstRequest: ahora, lastRequest: ahora };
    }
    
    // Incrementar contador
    log.count++;
    log.lastRequest = ahora;
    requestCache.set(clave, log);
    
    // Verificar si excede el límite
    if (log.count > limite.max) {
      const tiempoRestante = Math.ceil((limite.ventana - (ahora - log.firstRequest)) / 1000);
      return {
        permitido: false,
        mensaje: `Demasiadas peticiones. Espera ${tiempoRestante} segundos.`
      };
    }
    
    return { permitido: true };
  }

  /**
   * Limpiar cache antiguo (llamar periódicamente)
   */
  static limpiarCache() {
    const ahora = Date.now();
    const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hora
    
    for (const [clave, log] of requestCache.entries()) {
      if (ahora - log.lastRequest > CACHE_EXPIRY) {
        requestCache.delete(clave);
      }
    }
  }

  /**
   * Obtener estadísticas para debug
   */
  static obtenerEstadisticas() {
    return {
      total_ips: requestCache.size,
      cache_entries: Array.from(requestCache.entries()).map(([clave, log]) => ({
        key: clave,
        requests: log.count,
        ultimo_request: new Date(log.lastRequest).toLocaleString()
      }))
    };
  }
}

// Limpiar cache cada hora
setInterval(() => {
  AntiSpam.limpiarCache();
}, 60 * 60 * 1000); 
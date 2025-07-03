import * as Sentry from '@sentry/nextjs';

// Solo inicializar si tenemos DSN configurado
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Performance monitoring para servidor (reducido en desarrollo)
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 0.1 : 0.3,
    
    // Error tracking configuration
    beforeSend(event) {
      // En desarrollo, mostrar errores también en consola
      if (process.env.NODE_ENV === 'development') {
        console.log('[SENTRY] Error capturado:', event.exception?.values?.[0]?.value);
      }
      
      // Filtrar información sensible del servidor
      if (event.request) {
        delete event.request.headers?.['authorization'];
        delete event.request.headers?.['cookie'];
        delete event.request.headers?.['x-api-key'];
      }
      
      // Filtrar errores conocidos que no son críticos
      if (event.exception) {
        const error = event.exception.values?.[0];
        
        // No enviar errores de conexión temporales
        if (error?.value?.includes('ECONNRESET') || 
            error?.value?.includes('ETIMEDOUT') ||
            error?.value?.includes('ENOTFOUND')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Configuración de entorno
    environment: process.env.NODE_ENV,
    
    // Tags adicionales para servidor
    initialScope: {
      tags: {
        component: 'facturacion-backend-local',
        server: true
      }
    },
    
    // Configuración específica del servidor
    debug: process.env.NODE_ENV === 'development',
    
    // Límites de captura
    maxBreadcrumbs: 25, // Reducido para desarrollo local
  });
} else {
  console.log('[SENTRY] DSN no configurado, monitoring deshabilitado');
} 
/**
 * Logger específico para el servidor (APIs)
 * Solo usar en rutas de API y middleware del servidor
 */

// Intentar importar winston, con fallback
let winston: any = null;
try {
  winston = require('winston');
} catch (error) {
  // Winston no disponible, usar console
}

// Configuración de winston si está disponible
let logger: any;

if (winston) {
  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  };

  const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
  };

  winston.addColors(colors);

  const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info: any) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
  );

  const transports = [
    new winston.transports.Console({
      format: devFormat,
    })
  ];

  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format: devFormat,
    transports,
    exitOnError: false,
  });
} else {
  // Fallback simple
  logger = {
    error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
    warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
    info: (msg: string, ...args: any[]) => console.info(`[INFO] ${msg}`, ...args),
    http: (msg: string, ...args: any[]) => console.log(`[HTTP] ${msg}`, ...args),
    debug: (msg: string, ...args: any[]) => console.log(`[DEBUG] ${msg}`, ...args),
  };
}

export default logger;
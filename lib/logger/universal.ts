/**
 * Logger universal que funciona en servidor y cliente
 */

// Detectar si estamos en el servidor o cliente
const isServer = typeof window === 'undefined';

// Logger para servidor (fallback simple por ahora)
const serverLogger = {
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
  info: (msg: string, ...args: any[]) => console.info(`[INFO] ${msg}`, ...args),
  http: (msg: string, ...args: any[]) => console.log(`[HTTP] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.log(`[DEBUG] ${msg}`, ...args),
};

// Logger para cliente
const clientLogger = {
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
  info: (msg: string, ...args: any[]) => console.info(`[INFO] ${msg}`, ...args),
  http: (msg: string, ...args: any[]) => console.log(`[HTTP] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.log(`[DEBUG] ${msg}`, ...args),
};

// Exportar el logger apropiado
const logger = isServer ? serverLogger : clientLogger;

export default logger;
/**
 * Logger para el lado del cliente (browser)
 */

interface LogLevel {
  error: 0;
  warn: 1;
  info: 2;
  http: 3;
  debug: 4;
}

const levels: LogLevel = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const currentLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

class ClientLogger {
  private shouldLog(level: keyof LogLevel): boolean {
    return levels[level] <= levels[currentLevel as keyof LogLevel];
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  http(message: string, ...args: any[]): void {
    if (this.shouldLog('http')) {
      console.log(`[HTTP] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
}

export default new ClientLogger();
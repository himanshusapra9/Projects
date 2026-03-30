export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

export function createLogger(service: string): Logger {
  const format = (level: string, message: string, meta?: Record<string, unknown>) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      ...meta,
    };
    return JSON.stringify(entry);
  };

  return {
    info: (message, meta) => console.log(format('info', message, meta)),
    warn: (message, meta) => console.warn(format('warn', message, meta)),
    error: (message, meta) => console.error(format('error', message, meta)),
    debug: (message, meta) => console.debug(format('debug', message, meta)),
  };
}

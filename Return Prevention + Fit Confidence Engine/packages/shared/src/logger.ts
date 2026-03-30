export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function envLevel(): LogLevel {
  const raw = (typeof process !== 'undefined' && process.env?.LOG_LEVEL) || 'info';
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') return raw;
  return 'info';
}

export interface LogFields {
  [key: string]: unknown;
}

/** Minimal structured logger (JSON lines) suitable for serverless + local dev. */
export class Logger {
  constructor(
    private readonly service: string,
    private minLevel: LogLevel = envLevel(),
    private readonly extra: LogFields = {},
  ) {}

  child(fields: LogFields): Logger {
    return new Logger(this.service, this.minLevel, { ...this.extra, ...fields });
  }

  private should(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[this.minLevel];
  }

  private emit(level: LogLevel, msg: string, fields?: LogFields): void {
    if (!this.should(level)) return;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      service: this.service,
      msg,
      ...this.extra,
      ...fields,
    });
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  }

  debug(msg: string, fields?: LogFields): void {
    this.emit('debug', msg, fields);
  }

  info(msg: string, fields?: LogFields): void {
    this.emit('info', msg, fields);
  }

  warn(msg: string, fields?: LogFields): void {
    this.emit('warn', msg, fields);
  }

  error(msg: string, fields?: LogFields): void {
    this.emit('error', msg, fields);
  }
}

export const createLogger = (service: string): Logger => new Logger(service);

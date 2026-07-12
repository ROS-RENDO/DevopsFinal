import winston from 'winston';
import LokiTransport from 'winston-loki';

// ─── Custom Log Levels ──────────────────────────────────────────────────────────
const customLevels = {
  levels: {
    critical: 0,
    error: 1,
    warning: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    critical: 'magenta',
    error: 'red',
    warning: 'yellow',
    info: 'green',
    debug: 'blue',
  },
};

winston.addColors(customLevels.colors);

// ─── Secret Sanitizer ─────────────────────────────────────────────────────────
// Strips sensitive keys from log details so secrets NEVER appear in logs
const REDACTED_KEYS = ['password', 'token', 'authorization', 'cookie', 'secret', 'key', 'apikey'];

const sanitizeDetails = (details: Record<string, unknown> = {}): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    const normalizedKey = key.toLowerCase();
    if (REDACTED_KEYS.some((k) => normalizedKey.includes(k))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }
    if (typeof value === 'string' && value.length > 200) {
      sanitized[key] = `${value.slice(0, 197)}...`;
      continue;
    }
    sanitized[key] = value;
  }
  return sanitized;
};

// ─── Log Level Icons ───────────────────────────────────────────────────────────
const LEVEL_ICONS: Record<string, string> = {
  info:  '✅',
  warning:  '⚠️ ',
  error: '🔴',
  critical: '🔥',
  debug: '🔍',
};

// ─── Formats ───────────────────────────────────────────────────────────────────
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss Z' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, event, ...meta }) => {
    // Strip ansi color codes to find icon
    const plainLevel = level.replace(/\x1B\[[0-9;]*m/g, '');
    const icon = LEVEL_ICONS[plainLevel] ?? '📋';
    const eventStr = event ? ` [${event}]` : '';
    const metaStr = Object.keys(meta).length
      ? '\n    ' + JSON.stringify(meta, null, 2).replace(/\n/g, '\n    ')
      : '';
    return `${timestamp} ${icon} ${level}${eventStr}: ${message}${metaStr}`;
  }),
);

const prodFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss Z' }),
  winston.format.json(),
);

// ─── Winston Logger Instance ───────────────────────────────────────────────────
const transports: winston.transport[] = [
  // Always output to console
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  }),
];

// Add Loki transport if enabled/available (it maps nicely for Docker container setups)
transports.push(
  new LokiTransport({
    host: 'http://loki:3100', // Points to the Docker Loki container
    labels: { app: 'backend' },
    json: true,
    replaceTimestamp: true,
    format: prodFormat,
    onConnectionError: (err) => console.error('[Loki Connection Error]', err),
  })
);

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || 'debug',
  transports,
});

// ─── Public API ───────────────────────────────────────────────────────────────
export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export const logSecurityEvent = (
  event: string,
  details: Record<string, unknown> = {},
  level: LogLevel = 'info',
): void => {
  const clean = sanitizeDetails(details);
  logger.log(level, 'Security event', { event, ...clean });
};

export const log = {
  debug:    (message: string, meta?: Record<string, unknown>) => logger.log('debug', message, meta),
  info:     (message: string, meta?: Record<string, unknown>) => logger.log('info', message, meta),
  warning:  (message: string, meta?: Record<string, unknown>) => logger.log('warning', message, meta),
  error:    (message: string, meta?: Record<string, unknown>) => logger.log('error', message, meta),
  critical: (message: string, meta?: Record<string, unknown>) => logger.log('critical', message, meta),
};

export default logger;

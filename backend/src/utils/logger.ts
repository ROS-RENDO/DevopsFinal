import winston from 'winston';

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
  warn:  '⚠️ ',
  error: '🔴',
  debug: '🔍',
};

// ─── Dev Format (human-readable, colorized) ────────────────────────────────────
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ level: true }),
  winston.format.printf(({ timestamp, level, message, event, ...meta }) => {
    const icon = LEVEL_ICONS[level.replace(/\x1B\[[0-9;]*m/g, '')] ?? '📋';
    const eventStr = event ? ` [${event}]` : '';
    const metaStr = Object.keys(meta).length
      ? '\n    ' + JSON.stringify(meta, null, 2).replace(/\n/g, '\n    ')
      : '';
    return `${timestamp} ${icon} ${level}${eventStr}: ${message}${metaStr}`;
  }),
);

// ─── Production Format (structured JSON for log aggregators like Loki/Grafana) ─
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

// ─── Winston Logger Instance ───────────────────────────────────────────────────
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    // Console: always shown in terminal — NEVER sent to frontend
    new winston.transports.Console(),
  ],
});

// ─── Public API ───────────────────────────────────────────────────────────────
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const logSecurityEvent = (
  event: string,
  details: Record<string, unknown> = {},
  level: LogLevel = 'info',
): void => {
  const clean = sanitizeDetails(details);
  logger.log(level, 'Security event', { event, ...clean });
};

// Generic logger for non-security messages (HTTP requests, startup, etc.)
export const log = {
  info:  (message: string, meta?: Record<string, unknown>) => logger.info(message, meta),
  warn:  (message: string, meta?: Record<string, unknown>) => logger.warn(message, meta),
  error: (message: string, meta?: Record<string, unknown>) => logger.error(message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => logger.debug(message, meta),
};

export default logger;

type LogLevel = 'info' | 'warn' | 'error';

const sanitizeDetails = (details: Record<string, unknown> = {}): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(details)) {
    const normalizedKey = key.toLowerCase();
    if (['password', 'token', 'authorization', 'cookie', 'secret'].includes(normalizedKey)) {
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

export const logSecurityEvent = (event: string, details: Record<string, unknown> = {}, level: LogLevel = 'info'): void => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...sanitizeDetails(details),
  };

  if (level === 'error') {
    console.error(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
};

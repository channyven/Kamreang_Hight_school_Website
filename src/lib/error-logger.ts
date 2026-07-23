/**
 * Centralized error logging utility.
 * In production, this can be extended to send logs to a service like Sentry or Axiom.
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface LogContext extends Record<string, unknown> {
  severity?: ErrorSeverity;
  tags?: string[];
  userId?: string;
}

export function logError(error: unknown, context: LogContext = {}) {
  const { severity = 'medium', tags = [], ...extra } = context;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Basic console logging for now
  console.error(`[${severity.toUpperCase()}] ${errorMessage}`, {
    tags,
    ...extra,
    stack: errorStack,
    timestamp: new Date().toISOString(),
  });

  // Future: Integration with external monitoring services
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra, tags });
  // }
}

export function logWarning(message: string, context: LogContext = {}) {
  logError(message, { ...context, severity: 'low' });
}

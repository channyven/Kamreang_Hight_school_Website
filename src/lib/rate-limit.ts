const rateLimiter = new Map<string, { count: number; resetTime: number }>();

/**
 * Basic in-memory rate limiter for server actions
 * @param identifier A unique string to identify the user (e.g., IP address)
 * @param maxRequests Maximum requests allowed within the window
 * @param windowMs Time window in milliseconds
 * @returns boolean True if the request is allowed, false otherwise
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 1000
): boolean {
  const now = Date.now();
  const record = rateLimiter.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimiter.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

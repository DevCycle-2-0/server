import { Request, Response, NextFunction } from 'express';
import { RedisCache } from '@infrastructure/cache/RedisCache';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

export class RateLimiter {
  private cache: RedisCache | null = null;
  private inMemoryStore: Map<string, { count: number; resetTime: number }> = new Map();
  private useRedis: boolean;

  constructor() {
    this.useRedis = process.env.REDIS_ENABLED === 'true';
    if (this.useRedis) {
      try {
        this.cache = RedisCache.getInstance();
      } catch (error) {
        console.warn('⚠️  Redis not available, using in-memory rate limiting');
        this.useRedis = false;
      }
    }
  }

  createLimiter(options: RateLimitOptions) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const key = options.keyGenerator
          ? options.keyGenerator(req)
          : this.defaultKeyGenerator(req);

        const now = Date.now();
        const windowStart = now - options.windowMs;

        let requestCount: number;
        let resetTime: number;

        if (this.useRedis && this.cache) {
          // Redis-based rate limiting
          const result = await this.redisRateLimit(key, options.windowMs, options.maxRequests);
          requestCount = result.count;
          resetTime = result.resetTime;
        } else {
          // In-memory rate limiting
          const result = this.memoryRateLimit(key, windowStart, options.maxRequests);
          requestCount = result.count;
          resetTime = result.resetTime;
        }

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', options.maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - requestCount));
        res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));

        if (requestCount > options.maxRequests) {
          res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMITED',
              message: options.message || 'Too many requests, please try again later',
              retryAfter: Math.ceil((resetTime - now) / 1000),
            },
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        // On error, allow request to proceed
        next();
      }
    };
  }

  private defaultKeyGenerator(req: Request): string {
    // Use IP address and user ID (if authenticated) as key
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userId = (req as any).user?.sub || 'anonymous';
    return `ratelimit:${ip}:${userId}`;
  }

  private async redisRateLimit(
    key: string,
    windowMs: number,
    maxRequests: number
  ): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const windowKey = `${key}:${Math.floor(now / windowMs)}`;

    const currentCount = await this.cache!.get(windowKey);
    const count = currentCount ? parseInt(currentCount) + 1 : 1;

    await this.cache!.set(windowKey, count.toString(), Math.ceil(windowMs / 1000));

    const resetTime = (Math.floor(now / windowMs) + 1) * windowMs;

    return { count, resetTime };
  }

  private memoryRateLimit(
    key: string,
    windowStart: number,
    maxRequests: number
  ): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = this.inMemoryStore.get(key);

    if (!existing || existing.resetTime < now) {
      // New window
      const resetTime = now + (now - windowStart);
      this.inMemoryStore.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    }

    // Increment existing window
    existing.count += 1;
    this.inMemoryStore.set(key, existing);
    return { count: existing.count, resetTime: existing.resetTime };
  }

  // Cleanup old entries (for in-memory store)
  startCleanup(intervalMs: number = 60000) {
    if (!this.useRedis) {
      setInterval(() => {
        const now = Date.now();
        for (const [key, value] of this.inMemoryStore.entries()) {
          if (value.resetTime < now) {
            this.inMemoryStore.delete(key);
          }
        }
      }, intervalMs);
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();
rateLimiter.startCleanup();

// Predefined rate limiters
export const authRateLimit = rateLimiter.createLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again in a minute',
  keyGenerator: (req) => {
    const ip = req.ip || 'unknown';
    return `auth:${ip}`;
  },
});

export const passwordResetRateLimit = rateLimiter.createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: 'Too many password reset requests, please try again in an hour',
  keyGenerator: (req) => {
    const email = req.body.email || 'unknown';
    return `password-reset:${email}`;
  },
});

export const emailVerificationRateLimit = rateLimiter.createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: 'Too many verification emails sent, please try again in an hour',
  keyGenerator: (req) => {
    const userId = (req as any).user?.sub || 'unknown';
    return `email-verification:${userId}`;
  },
});

export const apiRateLimit = rateLimiter.createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'API rate limit exceeded, please try again later',
});

export const strictApiRateLimit = rateLimiter.createLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Rate limit exceeded for this endpoint',
});

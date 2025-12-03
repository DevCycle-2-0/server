import Redis from 'ioredis';
import { config } from '@config/env.config';

export class RedisCache {
  private client: Redis;
  private static instance: RedisCache;

  private constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  }

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async addToBlacklist(token: string, expiresIn: number): Promise<void> {
    await this.set(`blacklist:${token}`, '1', expiresIn);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    return this.exists(`blacklist:${token}`);
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}

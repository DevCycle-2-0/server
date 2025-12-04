import Redis from 'ioredis';
import { config } from '@config/env.config';

export class RedisCache {
  private client: Redis;
  private static instance: RedisCache;
  private connected: boolean = false;

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
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis connection error:', error.message);
      this.connected = false;
    });

    this.client.on('connect', () => {
      console.log('🔄 Redis connecting...');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis connected successfully');
      this.connected = true;
    });

    this.client.on('close', () => {
      console.log('⚠️  Redis connection closed');
      this.connected = false;
    });
  }

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    if (!this.connected) return null;
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.connected) return;
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.connected) return;
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.connected) return false;
    const result = await this.client.exists(key);
    return result === 1;
  }

  // JSON operations
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }

  async setJSON<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    if (!this.connected) return 0;
    return this.client.lpush(key, ...values);
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    if (!this.connected) return 0;
    return this.client.rpush(key, ...values);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!this.connected) return [];
    return this.client.lrange(key, start, stop);
  }

  async llen(key: string): Promise<number> {
    if (!this.connected) return 0;
    return this.client.llen(key);
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!this.connected) return 0;
    return this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    if (!this.connected) return [];
    return this.client.smembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    if (!this.connected) return false;
    const result = await this.client.sismember(key, member);
    return result === 1;
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.connected) return 0;
    return this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (!this.connected) return null;
    return this.client.hget(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.connected) return {};
    return this.client.hgetall(key);
  }

  // Token blacklist
  async addToBlacklist(token: string, expiresIn: number): Promise<void> {
    await this.set(`blacklist:${token}`, '1', expiresIn);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    return this.exists(`blacklist:${token}`);
  }

  // Session management
  async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    await this.setJSON(`session:${sessionId}`, data, ttl);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    return this.getJSON<T>(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.connected) return 0;
    const keys = await this.client.keys(pattern);
    if (keys.length === 0) return 0;
    return this.client.del(...keys);
  }

  // Workspace cache
  async cacheWorkspace(workspaceId: string, data: any, ttl: number = 300): Promise<void> {
    await this.setJSON(`workspace:${workspaceId}`, data, ttl);
  }

  async getCachedWorkspace<T>(workspaceId: string): Promise<T | null> {
    return this.getJSON<T>(`workspace:${workspaceId}`);
  }

  async invalidateWorkspaceCache(workspaceId: string): Promise<void> {
    await this.invalidatePattern(`workspace:${workspaceId}*`);
  }

  // Product cache
  async cacheProduct(productId: string, data: any, ttl: number = 300): Promise<void> {
    await this.setJSON(`product:${productId}`, data, ttl);
  }

  async getCachedProduct<T>(productId: string): Promise<T | null> {
    return this.getJSON<T>(`product:${productId}`);
  }

  // User cache
  async cacheUser(userId: string, data: any, ttl: number = 600): Promise<void> {
    await this.setJSON(`user:${userId}`, data, ttl);
  }

  async getCachedUser<T>(userId: string): Promise<T | null> {
    return this.getJSON<T>(`user:${userId}`);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.invalidatePattern(`user:${userId}*`);
  }

  // Analytics cache
  async cacheAnalytics(key: string, data: any, ttl: number = 1800): Promise<void> {
    await this.setJSON(`analytics:${key}`, data, ttl);
  }

  async getCachedAnalytics<T>(key: string): Promise<T | null> {
    return this.getJSON<T>(`analytics:${key}`);
  }

  // Graceful shutdown
  async close(): Promise<void> {
    if (this.connected) {
      await this.client.quit();
      this.connected = false;
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}

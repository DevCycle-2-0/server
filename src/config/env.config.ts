// src/config/env.config.ts
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// ✅ FIX: Validate environment variables at startup
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  API_VERSION: z.string().default('v1'),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
  DB_POOL_MIN: z.string().default('2'),
  DB_POOL_MAX: z.string().default('10'),
  DB_LOGGING: z.string().default('false'),

  // Redis
  REDIS_ENABLED: z.string().default('false'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),

  // JWT - CRITICAL: These must be secure in production
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

// Validate environment
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parseResult.error.format());
  process.exit(1);
}

const env = parseResult.data;

// ✅ FIX: Validate JWT secrets in production
if (env.NODE_ENV === 'production') {
  if (env.JWT_ACCESS_SECRET.includes('secret') || env.JWT_ACCESS_SECRET.length < 32) {
    console.error('❌ CRITICAL: JWT_ACCESS_SECRET is not secure for production!');
    process.exit(1);
  }

  if (env.JWT_REFRESH_SECRET.includes('secret') || env.JWT_REFRESH_SECRET.length < 32) {
    console.error('❌ CRITICAL: JWT_REFRESH_SECRET is not secure for production!');
    process.exit(1);
  }
}

export const config = {
  baseUrl: process.env.BASE_URL || `http://localhost:${env.PORT}`,
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  apiVersion: env.API_VERSION,

  database: {
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT, 10),
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    poolMin: parseInt(env.DB_POOL_MIN, 10),
    poolMax: parseInt(env.DB_POOL_MAX, 10),
    logging: env.DB_LOGGING === 'true',
  },

  redis: {
    enabled: env.REDIS_ENABLED === 'true',
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT, 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  cors: {
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
  },

  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  },
};

// Log configuration (hide sensitive data)
console.log('📋 Configuration loaded:');
console.log(`   Environment: ${config.env}`);
console.log(`   Port: ${config.port}`);
console.log(`   Database: ${config.database.host}:${config.database.port}/${config.database.name}`);
console.log(`   Redis: ${config.redis.enabled ? 'Enabled' : 'Disabled'}`);
console.log(`   CORS Origins: ${config.cors.origin.join(', ')}`);

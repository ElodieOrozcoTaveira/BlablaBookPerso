// backend/src/config/redis.ts
import { config } from 'dotenv';
config();

import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected successfully'));

export async function initializeSession() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return {
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    name: 'blablabook.sid',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 4 * 60 * 60 * 1000,
    },
  };
}

export default redisClient;

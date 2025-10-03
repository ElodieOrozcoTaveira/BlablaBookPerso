import { createClient } from 'redis';
import session from 'express-session';
import { RedisStore } from 'connect-redis';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

// Configuration session sécurisée avec Redis
export const sessionConfig = {
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    name: 'blablabook.sid', // Nom custom pour masquer qu'on utilise express-session
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict' as const,
        maxAge: 4 * 60 * 60 * 1000, // 4h avec rolling
    }
};

export default redisClient;
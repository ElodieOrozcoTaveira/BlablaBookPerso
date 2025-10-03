import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

// Configuration et création du client Redis
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379',
});

// Gestionnaires d'événements Redis
redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

redisClient.on('disconnect', () => {
    console.log('⚠️ Redis disconnected');
});

redisClient.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
});

/**
 * Initialise la connexion Redis
 */
export async function initializeRedis() {
    try {
        if (!redisClient.isOpen) {
            console.log('🔄 Connecting to Redis...');
            await redisClient.connect();
            console.log('✅ Redis initialization completed');
        }
        return redisClient;
    } catch (error) {
        console.error('❌ Redis initialization failed:', error);
        throw error;
    }
}

/**
 * Ferme proprement la connexion Redis
 */
export async function closeRedis() {
    try {
        if (redisClient.isOpen) {
            await redisClient.disconnect();
            console.log('✅ Redis connection closed');
        }
    } catch (error) {
        console.error('❌ Error closing Redis connection:', error);
    }
}

export default redisClient;

import { createClient } from 'redis';

export const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: 6379
    },
    password: ''
});

(async () => {
    try {
        await redisClient.connect();
        console.log('Redis client connected');
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
})();

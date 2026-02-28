const { getRedis } = require('../db/redis');

/**
 * Safely get Redis client with graceful error handling
 * Returns null if Redis cannot be accessed (allows operation to continue)
 * This enables graceful degradation if Redis is temporarily down
 */
function getSafeRedis() {
    try {
        return getRedis();
    } catch (error) {
        console.warn(`[Redis Safe Access] ⚠️  Redis unavailable: ${error.message}`);
        return null;
    }
}

/**
 * Safely get from Redis cache
 * Returns null if Redis fails, allowing fallback to database
 */
async function safeRedisGet(key) {
    const redis = getSafeRedis();
    if (!redis) return null;

    try {
        return await redis.get(key);
    } catch (error) {
        console.warn(`[Redis Safe Get] ⚠️  Failed to get key "${key}": ${error.message}`);
        return null;
    }
}

/**
 * Safely set to Redis cache
 * Silently fails if Redis is unavailable (doesn't block operation)
 */
async function safeRedisSetEx(key, ttl, value) {
    const redis = getSafeRedis();
    if (!redis) return false;

    try {
        await redis.setEx(key, ttl, value);
        return true;
    } catch (error) {
        console.warn(`[Redis Safe SetEx] ⚠️  Failed to set key "${key}": ${error.message}`);
        return false;
    }
}

module.exports = {
    getSafeRedis,
    safeRedisGet,
    safeRedisSetEx
};

const { safeRedisSetEx } = require('../db/redis-safe');
const { getSafeRedis } = require('../db/redis-safe');

/**
 * Invalidate stock cache for specific items
 * Called when stock updates occur to prevent stale data
 * 
 * @param {Array} items - Array of {itemId, quantity} objects to invalidate
 */
async function invalidateStockCache(items) {
    const redis = getSafeRedis();
    if (!redis) {
        console.warn('[Stock Cache Invalidation] ⚠️  Redis unavailable, cache invalidation skipped');
        return false;
    }

    try {
        const cacheKeyPrefix = 'gateway:stock:';
        // Get all stock cache keys
        const keys = await redis.keys(`${cacheKeyPrefix}*`);

        // Filter and delete only relevant keys (that contain the updated items)
        const itemIds = items.map(item => item.itemId);
        const keysToDelete = keys.filter(key => {
            // Check if any of the updated itemIds are in this cache key
            return itemIds.some(id => key.includes(id));
        });

        if (keysToDelete.length > 0) {
            await redis.del(keysToDelete);
            console.log(`[Stock Cache Invalidation] 🗑️  Invalidated ${keysToDelete.length} cache entries`);
            return true;
        }

        console.log('[Stock Cache Invalidation] ℹ️  No cache entries to invalidate');
        return true;
    } catch (error) {
        console.warn(`[Stock Cache Invalidation] ⚠️  Failed to invalidate cache: ${error.message}`);
        return false;
    }
}

/**
 * Clear all stock cache entries
 * Useful for cache reset or troubleshooting
 */
async function clearAllStockCache() {
    const redis = getSafeRedis();
    if (!redis) {
        console.warn('[Stock Cache Clear] ⚠️  Redis unavailable, cache clear skipped');
        return false;
    }

    try {
        const cacheKeyPrefix = 'gateway:stock:';
        const keys = await redis.keys(`${cacheKeyPrefix}*`);

        if (keys.length > 0) {
            await redis.del(keys);
            console.log(`[Stock Cache Clear] 🗑️  Cleared ${keys.length} cache entries`);
            return true;
        }

        console.log('[Stock Cache Clear] ℹ️  No cache entries to clear');
        return true;
    } catch (error) {
        console.warn(`[Stock Cache Clear] ⚠️  Failed to clear cache: ${error.message}`);
        return false;
    }
}

module.exports = {
    invalidateStockCache,
    clearAllStockCache
};

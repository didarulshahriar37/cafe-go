const { safeRedisGet, safeRedisSetEx } = require('../db/redis-safe');

const STOCK_CACHE_TTL = 60; // 60 seconds

/**
 * Generate a consistent cache key from items array
 * Sorts items to ensure same cart contents always produce same key
 */
function generateStockCacheKey(items) {
    const sortedItems = items
        .map(item => `${item.itemId}:${item.quantity}`)
        .sort()
        .join('|');
    return `gateway:stock:${sortedItems}`;
}

/**
 * Check stock availability with Redis caching
 * Gracefully falls back to direct stock-service call if Redis fails
 * 
 * @param {Array} items - Array of {itemId, quantity} objects
 * @returns {Promise} - Stock availability response from cache or stock-service
 */
async function checkStockWithCache(items) {
    const cacheKey = generateStockCacheKey(items);

    // Attempt to get from Redis cache (gracefully handles Redis unavailability)
    const cachedStock = await safeRedisGet(cacheKey);

    if (cachedStock) {
        console.log(`[Stock Cache] ✅ Cache HIT for: ${cacheKey.substring(0, 50)}...`);
        return JSON.parse(cachedStock);
    }

    console.log(`[Stock Cache] ❌ Cache MISS for: ${cacheKey.substring(0, 50)}...`);

    // Cache miss or Redis unavailable: call stock-service directly
    const stockData = await fetchStockFromService(items);

    // Attempt to cache the result for future requests (fire-and-forget)
    await safeRedisSetEx(cacheKey, STOCK_CACHE_TTL, JSON.stringify(stockData));

    return stockData;
}

/**
 * Fetch stock availability directly from stock-service
 * @param {Array} items - Array of {itemId, quantity} objects
 * @returns {Promise} - Stock check response
 */
async function fetchStockFromService(items) {
    const stockUrl = process.env.STOCK_SERVICE_URL || 'http://localhost:3001';

    const response = await fetch(`${stockUrl}/api/stock/check`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
    });

    const stockData = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify({
            status: response.status,
            data: stockData
        }));
    }

    return stockData;
}

module.exports = {
    checkStockWithCache,
    generateStockCacheKey
};

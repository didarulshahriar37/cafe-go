const { getRedis } = require('../db/redis');
const { publishToQueue } = require('../db/rabbitmq');

async function orchestrateOrder(user, items, idempotencyKey) {
    const redis = getRedis();

    // 1. Gateway-Level Check: Deduplication / Idempotency 
    // If the client retries, we can capture it here before even making HTTP calls to stock
    // But stock-service is also idempotent. Gateway checking means we save network hops.
    const cacheKey = `gateway:idempotency:${idempotencyKey}`;
    const cachedResponse = await redis.get(cacheKey);
    if (cachedResponse) {
        console.log(`[Gateway] Found cached order for ID: ${idempotencyKey}`);
        return JSON.parse(cachedResponse);
    }

    // 2. HTTP Call to Stock Service
    const stockUrl = process.env.STOCK_SERVICE_URL || 'http://localhost:3001';

    // We use native fetch (available in Node 18+)
    const response = await fetch(`${stockUrl}/api/stock/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({ items })
    });

    const stockData = await response.json();

    if (!response.ok) {
        // Stock reservation failed (e.g., 409 Conflict - Insufficient stock)
        throw new Error(JSON.stringify({
            status: response.status,
            data: stockData
        }));
    }

    // 3. Stock Resereved Successfully -> Publish to RabbitMQ
    // The Kitchen Service will pick this up and actually process the real order
    const orderPayload = {
        userId: user.uid,
        userEmail: user.email,
        idempotencyKey,
        reservedItems: stockData.data.items, // the successfully reserved things
        status: 'PENDING_KITCHEN',
        timestamp: new Date().toISOString()
    };

    publishToQueue('kitchen_orders', orderPayload);

    // 4. Cache the success response at edge to stop retries dead in their tracks
    const finalResponse = {
        success: true,
        message: 'Order accepted and sent to kitchen',
        orderEstimate: '10-15 mins', // Usually kitchen predicts this, but hardcoded for now
        details: orderPayload
    };

    await redis.setEx(cacheKey, 60 * 60, JSON.stringify(finalResponse));

    return finalResponse;
}

module.exports = {
    orchestrateOrder
};

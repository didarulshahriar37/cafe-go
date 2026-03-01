const { getRedis } = require('../db/redis');

// name of this service (should match the key used by gateway admin)
const SERVICE_NAME = 'stock-service';

async function chaosMiddleware(req, res, next) {
    try {
        const redis = getRedis();
        const val = await redis.get(`chaos:${SERVICE_NAME}`);
        if (val === '1') {
            // service is disabled by admin toggle
            return res.status(503).json({ error: 'service disabled by admin' });
        }
    } catch (err) {
        // if redis is down we cannot check toggle; just continue and let other code handle errors
        console.error('Chaos check failed', err);
    }
    next();
}

module.exports = chaosMiddleware;

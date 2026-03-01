const { getRedis } = require('../db/redis');
const SERVICE_NAME = 'kitchen-service';

async function chaosMiddleware(req, res, next) {
    try {
        const redis = getRedis();
        const val = await redis.get(`chaos:${SERVICE_NAME}`);
        if (val === '1') {
            return res.status(503).json({ error: 'service disabled by admin' });
        }
    } catch (err) {
        console.error('Chaos check failed', err);
    }
    next();
}

module.exports = chaosMiddleware;

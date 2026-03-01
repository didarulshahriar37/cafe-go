const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        const { getRedis } = require('../db/redis');
        const redis = getRedis();
        await redis.ping();

        const chaos = await redis.get('chaos:gateway-service');
        if (chaos === '1') {
            return res.status(503).json({ status: 'DOWN', reason: 'disabled-by-admin' });
        }

        res.status(200).json({ status: 'UP', service: 'gateway-service' });
    } catch (err) {
        res.status(503).json({ status: 'DOWN', error: err.message });
    }
});

module.exports = router;

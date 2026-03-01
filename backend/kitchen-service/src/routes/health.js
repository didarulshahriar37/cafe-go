const express = require('express');
const router = express.Router();
const { getDB } = require('../db/mongo');
const { getRedis } = require('../db/redis');

router.get('/health', async (req, res) => {
    try {
        const db = getDB();
        const redis = getRedis();

        await db.command({ ping: 1 });
        await redis.ping();

        const chaos = await redis.get('chaos:kitchen-service');
        if (chaos === '1') {
            return res.status(503).json({ status: 'DOWN', reason: 'disabled-by-admin' });
        }

        res.status(200).json({ status: 'UP', service: 'kitchen-service' });
    } catch (err) {
        res.status(503).json({ status: 'DOWN', error: err.message });
    }
});

module.exports = router;

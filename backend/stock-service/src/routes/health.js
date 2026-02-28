const express = require('express');
const router = express.Router();
const { getDB } = require('../db/mongo');
const { getRedis } = require('../db/redis');

router.get('/health', async (req, res) => {
    try {
        const db = getDB();
        const redis = getRedis();

        // Check MongoDB Connection
        await db.command({ ping: 1 });

        // Check Redis Connection
        await redis.ping();

        res.status(200).json({ status: 'UP', service: 'stock-service' });
    } catch (error) {
        res.status(503).json({ status: 'DOWN', error: error.message });
    }
});

module.exports = router;

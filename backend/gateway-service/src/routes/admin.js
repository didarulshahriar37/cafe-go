const express = require('express');
const router = express.Router();
const { getRedis } = require('../db/redis');

// list of services we manage chaos for
const SERVICES = [
    'gateway-service',
    'stock-service',
    'kitchen-service',
    'notification-service'
];

// GET /admin/chaos -> return current enabled/disabled state for all services
router.get('/admin/chaos', async (req, res) => {
    try {
        const redis = getRedis();
        const statuses = await Promise.all(
            SERVICES.map(async (s) => {
                const val = await redis.get(`chaos:${s}`);
                return { service: s, enabled: val !== '1' };
            })
        );
        res.json(statuses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /admin/chaos/:service { enabled: boolean }
router.post('/admin/chaos/:service', async (req, res) => {
    const service = req.params.service;
    if (!SERVICES.includes(service)) {
        return res.status(400).json({ error: 'unknown service' });
    }

    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'enabled boolean required' });
    }

    try {
        const redis = getRedis();
        // store 1 for disabled, 0 or missing for enabled
        await redis.set(`chaos:${service}`, enabled ? '0' : '1');
        res.json({ service, enabled });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

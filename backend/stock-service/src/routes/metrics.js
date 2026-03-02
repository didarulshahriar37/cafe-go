const express = require('express');
const router = express.Router();
const { getMetrics, resetMetrics } = require('../utils/metrics');

router.get('/metrics', (req, res) => {
    res.json(getMetrics('stock-service'));
});

router.post('/metrics/reset', (req, res) => {
    resetMetrics();
    res.json({ message: 'Metrics reset successfully' });
});

module.exports = router;

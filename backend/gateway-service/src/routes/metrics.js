const express = require('express');
const router = express.Router();
const { metricsHandler } = require('../middleware/metrics');

// simple JSON endpoint, metricsMiddleware records data on every request
router.get('/metrics', metricsHandler);

module.exports = router;

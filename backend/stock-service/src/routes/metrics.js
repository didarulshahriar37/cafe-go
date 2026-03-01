const express = require('express');
const router = express.Router();
const { metricsHandler } = require('../middleware/metrics');

router.get('/metrics', metricsHandler);

module.exports = router;

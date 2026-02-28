const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
    // Gateway health check
    res.status(200).json({ status: 'UP', service: 'gateway-service' });
});

module.exports = router;

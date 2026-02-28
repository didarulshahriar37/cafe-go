const express = require('express');
const router = express.Router();
const { verifyAuthToken } = require('../middleware/auth');
const { handlePlaceOrder } = require('../controllers/order.ctrl');

// API routes inside Gateway
router.post('/orders', verifyAuthToken, handlePlaceOrder);

module.exports = router;

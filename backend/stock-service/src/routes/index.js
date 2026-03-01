const express = require('express');
const router = express.Router();
const stockCtrl = require('../controllers/stock.ctrl');

router.get('/', stockCtrl.listItems);
router.post('/checkout', stockCtrl.handleCheckout);
router.post('/check', stockCtrl.handleCheckStock);

module.exports = router;

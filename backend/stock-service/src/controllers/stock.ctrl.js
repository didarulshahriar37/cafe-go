const { reserveStock, getInventory, checkStock } = require('../services/stock.srv');

async function listItems(req, res, next) {
    try {
        const items = await getInventory();
        return res.status(200).json(items);
    } catch (error) {
        next(error);
    }
}

async function handleCheckout(req, res, next) {
    try {
        const { items } = req.body;
        const idempotencyKey = req.headers['idempotency-key'];

        if (!idempotencyKey) {
            return res.status(400).json({ error: 'Idempotency-Key header is required' });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Array of items is required' });
        }

        const reservationResult = await reserveStock(items, idempotencyKey);

        return res.status(200).json({
            message: 'Stock successfully reserved.',
            data: reservationResult
        });
    } catch (error) {
        if (error.message.includes('Insufficient stock')) {
            return res.status(409).json({ error: 'Conflict', message: error.message });
        }
        next(error);
    }
}

async function handleCheckStock(req, res, next) {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Array of items is required' });
        }
        const result = await checkStock(items);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(409).json({ error: 'Stock Check Failed', message: error.message });
    }
}

module.exports = {
    handleCheckout,
    listItems,
    handleCheckStock
};

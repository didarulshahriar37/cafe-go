const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const stockRoutes = require('./routes/index');
const healthRoute = require('./routes/health');
const metricsRoute = require('./routes/metrics');
const { metricsMiddleware } = require('./middleware/metrics');
const chaosMiddleware = require('./middleware/chaos');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(chaosMiddleware); // check chaos toggle early
app.use(metricsMiddleware);
app.use(express.json());

// Routes
app.use('/', healthRoute);
app.use('/', metricsRoute);
app.use('/api/stock', stockRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;

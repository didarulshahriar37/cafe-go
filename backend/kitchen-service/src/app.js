const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { metricsMiddleware, metricsHandler } = require('./middleware/metrics');
const chaosMiddleware = require('./middleware/chaos');
const healthRoute = require('./routes/health');

const app = express();
app.use(helmet());
app.use(cors());
app.use(chaosMiddleware);
app.use(metricsMiddleware); // record metrics on every route
app.use(express.json());

app.use('/', healthRoute);
app.get('/metrics', metricsHandler);

module.exports = app;

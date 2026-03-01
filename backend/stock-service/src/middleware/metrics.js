// in-memory metrics tracking for stock-service
const metricsData = {
    totalRequests: 0,
    failures: 0,
    totalResponseTime: 0,
};

function metricsMiddleware(req, res, next) {
    const start = Date.now();
    metricsData.totalRequests++;

    res.on('finish', () => {
        const duration = Date.now() - start;
        metricsData.totalResponseTime += duration;
        if (res.statusCode >= 400) {
            metricsData.failures++;
        }
    });

    next();
}

function metricsHandler(req, res) {
    const avg = metricsData.totalRequests
        ? metricsData.totalResponseTime / metricsData.totalRequests
        : 0;

    res.json({
        totalRequests: metricsData.totalRequests,
        failures: metricsData.failures,
        averageResponseTime: avg,
    });
}

module.exports = {
    metricsMiddleware,
    metricsHandler,
};

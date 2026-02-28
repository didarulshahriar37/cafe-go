require('dotenv').config();
const app = require('./app');
const { connectRedis } = require('./db/redis');
const { connectRabbitMQ } = require('./db/rabbitmq');

const PORT = process.env.PORT || 8080;

async function startServer() {
    try {
        await connectRedis();
        await connectRabbitMQ();

        // Ensure Firebase gets initialized early (lazy init triggered)
        // require('./middleware/auth').getFirebase();

        const server = app.listen(PORT, () => {
            console.log(`🚀 Gateway Service mapping traffic on port ${PORT}`);
        });

        // Graceful shutdown
        const shutdown = () => {
            console.log('🛑 Shutting down Gateway...');
            server.close(() => process.exit(0));
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (error) {
        console.error('❌ Failed to start Gateway:', error);
        process.exit(1);
    }
}

startServer();

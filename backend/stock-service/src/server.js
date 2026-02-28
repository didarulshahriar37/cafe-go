require('dotenv').config();
const app = require('./app');
const { connectDB, closeDB } = require('./db/mongo');
const { connectRedis } = require('./db/redis');

const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        // Initialize connections before accepting HTTP traffic
        await connectDB('cafe_inventory');
        await connectRedis();

        const server = app.listen(PORT, () => {
            console.log(`🚀 Stock Service is running on port ${PORT}`);
        });

        // Graceful Shutdown Support
        const shutdown = async () => {
            console.log('🛑 Shutting down gracefully...');
            server.close(async () => {
                await closeDB();
                process.exit(0);
            });
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (error) {
        console.error('❌ Failed to start the server:', error);
        process.exit(1);
    }
}

startServer();

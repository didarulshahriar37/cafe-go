require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./db/mongo');
const { connectRabbitMQ, startConsuming } = require('./db/rabbitmq');
const { processOrder } = require('./services/kitchen.srv');

const PORT = process.env.PORT || 3002;

async function startServer() {
    try {
        await connectDB();
        await connectRabbitMQ();

        // Start the background consumer
        await startConsuming(processOrder);

        app.listen(PORT, () => {
            console.log(`🍳 Kitchen Service active on port ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Failed to start Kitchen Service:', error);
        process.exit(1);
    }
}

startServer();

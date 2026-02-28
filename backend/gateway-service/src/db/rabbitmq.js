const amqp = require('amqplib');

let channel = null;

async function connectRabbitMQ() {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
    try {
        const connection = await amqp.connect(rabbitUrl);
        channel = await connection.createChannel();

        // Assert queue to ensure it exists before publishing
        await channel.assertQueue('kitchen_orders', { durable: true });

        console.log('✅ Gateway RabbitMQ Publisher Connected');
        return channel;
    } catch (error) {
        console.error('❌ Gateway RabbitMQ Connection Error:', error);
        process.exit(1);
    }
}

function publishToQueue(queueName, data) {
    if (!channel) {
        throw new Error('RabbitMQ channel not initialized');
    }
    // Convert JS object to Buffer, and persist message to disk (persistent: true)
    return channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
        persistent: true
    });
}

module.exports = {
    connectRabbitMQ,
    publishToQueue
};

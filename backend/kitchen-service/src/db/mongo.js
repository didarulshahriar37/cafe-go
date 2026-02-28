const { MongoClient } = require('mongodb');

// In production, always use environment variables. 
// Falling back to provided URI for development/hackathon purposes.
const uri = process.env.MONGO_URI || "mongodb+srv://cafe_go_db:ulA7hof1EcajUPYm@cluster0.spgu1hn.mongodb.net/?appName=Cluster0";

let client = null;
let dbInstance = null;

/**
 * Initialize the MongoDB connection natively
 * @param {string} dbName - The specific database name for this microservice (e.g., 'cafe_inventory')
 */
async function connectDB(dbName) {
    // Return early if already connected (reusable connection)
    if (dbInstance) {
        return dbInstance;
    }

    try {
        // Configure connection pool for scalability
        client = new MongoClient(uri, {
            maxPoolSize: 10, // Limits active connections
            minPoolSize: 2,  // Maintains 2 connections ready at all times
            serverSelectionTimeoutMS: 5000,
        });

        await client.connect();
        dbInstance = client.db(dbName);

        console.log(`✅ MongoDB Connected securely to DB: ${dbName}`);

        // Listen for unexpected connection drops
        client.on('close', () => {
            console.warn('⚠️ MongoDB connection closed unexpectedly.');
            dbInstance = null; // Forces health checks to fail and triggers reconnection on next call
        });

        return dbInstance;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        // If we can't connect at boot, we should crash the pod so Docker/K8s restarts it
        process.exit(1);
    }
}

/**
 * Get the initialized database instance synchronously.
 * Must be called after connectDB() finishes.
 */
function getDB() {
    if (!dbInstance) {
        throw new Error('Database not initialized. Call connectDB() first during server startup.');
    }
    return dbInstance;
}

/**
 * Gracefully close the database connection.
 * Used during SIGTERM/SIGINT signals to prevent data corruption.
 */
async function closeDB() {
    if (client) {
        try {
            await client.close();
            console.log('🛑 MongoDB connection closed gracefully.');
            client = null;
            dbInstance = null;
        } catch (error) {
            console.error('❌ Error closing MongoDB connection:', error);
            process.exit(1);
        }
    }
}

module.exports = {
    connectDB,
    getDB,
    closeDB
};

import app from './app.js';
import { config } from './config/index.js';
import { prisma } from './config/prisma.js';
import { redisClient } from './config/redis.js';

const startServer = async (): Promise<void> => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected');

        // Start the server
        const server = app.listen(config.port, () => {
            console.log(`
🚀 Server running in ${config.env} mode
📡 API: http://localhost:${config.port}/api
❤️  Health: http://localhost:${config.port}/health
      `);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal: string): Promise<void> => {
            console.log(`\n📴 ${signal} received. Shutting down gracefully...`);

            server.close(async () => {
                console.log('🔌 HTTP server closed');

                await prisma.$disconnect();
                console.log('🔌 Database disconnected');

                await redisClient.disconnect();
                console.log('🔌 Redis disconnected');

                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('⚠️  Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

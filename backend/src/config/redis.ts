import Redis from 'ioredis';
import { config } from './index.js';

class RedisClient {
    private client: Redis | null = null;
    private isConnected: boolean = false;

    connect(): Redis | null {
        if (!this.client) {
            try {
                this.client = new Redis(config.redis.url, {
                    maxRetriesPerRequest: 1,
                    retryStrategy(times) {
                        if (times > 2) {
                            console.log('⚠️  Redis not available, caching disabled');
                            return null; // Stop retrying
                        }
                        return Math.min(times * 100, 1000);
                    },
                    lazyConnect: true,
                });

                this.client.on('connect', () => {
                    console.log('✅ Redis connected');
                    this.isConnected = true;
                });

                this.client.on('error', (err) => {
                    if (this.isConnected) {
                        console.error('❌ Redis error:', err.message);
                    }
                    this.isConnected = false;
                });

                // Try to connect but don't block
                this.client.connect().catch(() => {
                    console.log('⚠️  Redis connection failed, caching disabled');
                    this.isConnected = false;
                });
            } catch {
                console.log('⚠️  Redis not configured, caching disabled');
                return null;
            }
        }

        return this.client;
    }

    getClient(): Redis | null {
        if (!this.client) {
            return this.connect();
        }
        return this.isConnected ? this.client : null;
    }

    isAvailable(): boolean {
        return this.isConnected && this.client !== null;
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.client = null;
            this.isConnected = false;
        }
    }
}

export const redisClient = new RedisClient();
export const redis = redisClient.connect();

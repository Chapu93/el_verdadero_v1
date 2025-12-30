import { redis, redisClient } from '../config/redis.js';
import { config } from '../config/index.js';

export class CacheService {
    private prefix = 'saas:';

    private getKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    private isAvailable(): boolean {
        return redisClient.isAvailable();
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.isAvailable() || !redis) return null;

        try {
            const data = await redis.get(this.getKey(key));
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch {
            return null;
        }
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        if (!this.isAvailable() || !redis) return;

        try {
            const serialized = JSON.stringify(value);
            const fullKey = this.getKey(key);

            if (ttlSeconds) {
                await redis.setex(fullKey, ttlSeconds, serialized);
            } else {
                await redis.set(fullKey, serialized);
            }
        } catch {
            // Silently fail if Redis is not available
        }
    }

    async del(key: string): Promise<void> {
        if (!this.isAvailable() || !redis) return;

        try {
            await redis.del(this.getKey(key));
        } catch {
            // Silently fail
        }
    }

    async invalidatePattern(pattern: string): Promise<void> {
        if (!this.isAvailable() || !redis) return;

        try {
            const keys = await redis.keys(this.getKey(pattern));
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch {
            // Silently fail
        }
    }

    // Convenience method for stats caching - works without Redis
    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds: number = config.cache.statsTtl
    ): Promise<T> {
        // Try to get from cache
        const cached = await this.get<T>(key);

        if (cached !== null) {
            return cached;
        }

        // Fetch fresh data
        const fresh = await fetcher();

        // Try to cache it (will be no-op if Redis unavailable)
        await this.set(key, fresh, ttlSeconds);

        return fresh;
    }
}

export const cacheService = new CacheService();

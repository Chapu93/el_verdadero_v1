import { prisma } from '../config/prisma.js';
import { cacheService } from './cache.service.js';
import { config } from '../config/index.js';
import type { DashboardStats } from '../types/index.js';

export class StatsService {
    private readonly CACHE_KEY = 'stats:dashboard';

    async getDashboardStats(): Promise<DashboardStats> {
        return cacheService.getOrSet(
            this.CACHE_KEY,
            () => this.fetchDashboardStats(),
            config.cache.statsTtl
        );
    }

    private async fetchDashboardStats(): Promise<DashboardStats> {
        const [
            totalOrders,
            pendingOrders,
            processingOrders,
            completedOrders,
            cancelledOrders,
            revenueResult,
            totalCustomers,
            activeCustomers,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'PROCESSING' } }),
            prisma.order.count({ where: { status: 'COMPLETED' } }),
            prisma.order.count({ where: { status: 'CANCELLED' } }),
            prisma.order.aggregate({
                where: { status: { not: 'CANCELLED' } },
                _sum: { total: true },
            }),
            prisma.customer.count(),
            prisma.customer.count({ where: { status: 'ACTIVE' } }),
        ]);

        const totalRevenue = revenueResult._sum.total?.toNumber() ?? 0;

        return {
            totalOrders,
            pendingOrders,
            processingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue,
            totalCustomers,
            activeCustomers,
        };
    }

    async invalidateCache(): Promise<void> {
        await cacheService.del(this.CACHE_KEY);
    }
}

export const statsService = new StatsService();

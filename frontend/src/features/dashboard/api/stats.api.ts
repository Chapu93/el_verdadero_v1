import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';

// Types
export interface DashboardStats {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    activeCustomers: number;
}

// API Functions
export const statsApi = {
    getDashboard: () => get<DashboardStats>('/stats/dashboard'),
};

// React Query Hooks
export function useDashboardStats() {
    return useQuery({
        queryKey: ['stats', 'dashboard'],
        queryFn: statsApi.getDashboard,
        staleTime: 60 * 1000, // 60 seconds - matches backend cache
    });
}

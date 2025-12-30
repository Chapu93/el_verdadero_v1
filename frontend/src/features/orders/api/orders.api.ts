import { useQuery } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api';

// Types
export interface Order {
    id: string;
    orderNumber: string;
    total: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
    orderDate: string;
    customer: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
}

export interface CreateOrderDto {
    customerId: string;
    total: number;
    status?: Order['status'];
}

// API Functions
export const ordersApi = {
    getAll: (page = 1, limit = 10, status?: string) =>
        get<Order[]>('/orders', { page, limit, status }),

    getById: (id: string) =>
        get<Order>(`/orders/${id}`),

    create: (data: CreateOrderDto) =>
        post<Order>('/orders', data),

    update: (id: string, data: Partial<CreateOrderDto>) =>
        patch<Order>(`/orders/${id}`, data),

    delete: (id: string) =>
        del<{ message: string }>(`/orders/${id}`),
};

// React Query Hooks
export function useOrders(page = 1, limit = 10, status?: string) {
    return useQuery({
        queryKey: ['orders', page, limit, status],
        queryFn: () => ordersApi.getAll(page, limit, status),
    });
}

export function useOrder(id: string) {
    return useQuery({
        queryKey: ['orders', id],
        queryFn: () => ordersApi.getById(id),
        enabled: !!id,
    });
}

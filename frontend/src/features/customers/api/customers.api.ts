import { useQuery } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api';

// Types
export interface Customer {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    registrationDate: string;
    _count?: {
        orders: number;
    };
}

export interface CreateCustomerDto {
    name: string;
    email: string;
    avatar?: string;
    status?: Customer['status'];
}

// API Functions
export const customersApi = {
    getAll: (page = 1, limit = 10, search?: string) =>
        get<Customer[]>('/customers', { page, limit, search }),

    getById: (id: string) =>
        get<Customer>(`/customers/${id}`),

    create: (data: CreateCustomerDto) =>
        post<Customer>('/customers', data),

    update: (id: string, data: Partial<CreateCustomerDto>) =>
        patch<Customer>(`/customers/${id}`, data),

    delete: (id: string) =>
        del<{ message: string }>(`/customers/${id}`),
};

// React Query Hooks
export function useCustomers(page = 1, limit = 10, search?: string) {
    return useQuery({
        queryKey: ['customers', page, limit, search],
        queryFn: () => customersApi.getAll(page, limit, search),
    });
}

export function useCustomer(id: string) {
    return useQuery({
        queryKey: ['customers', id],
        queryFn: () => customersApi.getById(id),
        enabled: !!id,
    });
}

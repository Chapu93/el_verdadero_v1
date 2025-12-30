import { Request } from 'express';

// Type definitions for enum-like values (using strings for SQLite compatibility)
export type UserRole = 'ADMIN' | 'USER';
export type SubscriptionPlan = 'FREE' | 'PRO';
export type CustomerStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

// User types
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

// Pagination
export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

// Dashboard Stats
export interface DashboardStats {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    processingOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    activeCustomers: number;
}

// DTOs
export interface CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
}

export interface CreateCustomerDto {
    name: string;
    email: string;
    avatar?: string;
    status?: CustomerStatus;
}

export interface UpdateCustomerDto {
    name?: string;
    email?: string;
    avatar?: string;
    status?: CustomerStatus;
}

export interface CreateOrderDto {
    customerId: string;
    total: number;
    status?: OrderStatus;
}

export interface UpdateOrderDto {
    status?: OrderStatus;
    total?: number;
}

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = '/api';

// Create axios instance
export const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear token
            // Don't redirect here, let the ProtectedRoute handle it
            localStorage.removeItem('token');

            // Clear zustand persisted state
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
                localStorage.setItem('auth-storage', JSON.stringify({
                    state: { token: null, user: null, isAuthenticated: false },
                    version: 0
                }));
            }

            // Only redirect if we're not already on the login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// API Response Types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    error?: {
        message: string;
        code?: string;
    };
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Generic API helper functions
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await api.get<ApiResponse<T>>(url, { params });
    return response.data;
}

export async function post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await api.post<ApiResponse<T>>(url, data);
    return response.data;
}

export async function patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await api.patch<ApiResponse<T>>(url, data);
    return response.data;
}

export async function del<T>(url: string): Promise<ApiResponse<T>> {
    const response = await api.delete<ApiResponse<T>>(url);
    return response.data;
}

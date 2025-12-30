import { useQuery } from '@tanstack/react-query';
import { get, patch } from '@/lib/api';

// Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    bio?: string;
    avatar?: string;
    role: 'ADMIN' | 'USER';
    createdAt: string;
}

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
}

// API Functions
export const usersApi = {
    getMe: () =>
        get<User>('/users/me'),

    updateMe: (data: UpdateUserDto) =>
        patch<User>('/users/me', data),
};

// React Query Hooks
export function useCurrentUser() {
    return useQuery({
        queryKey: ['users', 'me'],
        queryFn: () => usersApi.getMe(),
    });
}

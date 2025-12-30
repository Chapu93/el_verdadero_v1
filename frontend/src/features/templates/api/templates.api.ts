import { useQuery } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api';

// Types
export interface Template {
    id: string;
    name: string;
    description?: string;
    thumbnail?: string;
    htmlContent: string;
    cssContent?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        pages: number;
    };
}

export interface CreateTemplateDto {
    name: string;
    description?: string;
    thumbnail?: string;
    htmlContent: string;
    cssContent?: string;
    isActive?: boolean;
}

export type UpdateTemplateDto = Partial<CreateTemplateDto>;

// API Functions
export const templatesApi = {
    getAll: (page = 1, limit = 10, search?: string) =>
        get<Template[]>('/templates', { page, limit, search }),

    getById: (id: string) =>
        get<Template>(`/templates/${id}`),

    create: (data: CreateTemplateDto) =>
        post<Template>('/templates', data),

    update: (id: string, data: UpdateTemplateDto) =>
        patch<Template>(`/templates/${id}`, data),

    delete: (id: string) =>
        del(`/templates/${id}`),
};

// React Query Hooks
export function useTemplates(page = 1, limit = 10, search?: string) {
    return useQuery({
        queryKey: ['templates', page, limit, search],
        queryFn: () => templatesApi.getAll(page, limit, search),
    });
}

export function useTemplate(id: string) {
    return useQuery({
        queryKey: ['templates', id],
        queryFn: () => templatesApi.getById(id),
        enabled: !!id,
    });
}

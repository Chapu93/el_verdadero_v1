import { useQuery } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api';
import { Template } from '@/features/templates/api/templates.api';

// Types
export interface PageElement {
    id: string;
    pageId: string;
    elementKey: string;
    type: 'TEXT' | 'IMAGE' | 'COLOR' | 'LINK';
    content: string;
    label?: string;
}

export interface Page {
    id: string;
    templateId: string;
    customerId: string;
    name: string;
    slug: string;
    customCss?: string;
    theme?: string; // JSON
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    template?: Template;
    customer?: {
        id: string;
        name: string;
        email: string;
    };
    elements?: PageElement[];
    _count?: {
        elements: number;
    };
}

export interface CreatePageDto {
    templateId: string;
    customerId: string;
    name: string;
    slug: string;
    customCss?: string;
}

export interface UpdatePageDto {
    name?: string;
    slug?: string;
    customCss?: string;
    theme?: string;
    isPublished?: boolean;
}

// API Functions
export const pagesApi = {
    getAll: (page = 1, limit = 10, customerId?: string, search?: string) =>
        get<Page[]>('/pages', { page, limit, customerId, search }),

    getById: (id: string) =>
        get<Page>(`/pages/${id}`),

    create: (data: CreatePageDto) =>
        post<Page>('/pages', data),

    update: (id: string, data: UpdatePageDto) =>
        patch<Page>(`/pages/${id}`, data),

    delete: (id: string) =>
        del(`/pages/${id}`),

    publish: (id: string) =>
        post<Page>(`/pages/${id}/publish`, {}),

    unpublish: (id: string) =>
        post<Page>(`/pages/${id}/unpublish`, {}),

    // Elements
    getElements: (pageId: string) =>
        get<PageElement[]>(`/pages/${pageId}/elements`),

    updateElement: (pageId: string, elementKey: string, content: string) =>
        patch<PageElement>(`/pages/${pageId}/elements/${elementKey}`, { content }),
};

// React Query Hooks
export function usePages(page = 1, limit = 10, customerId?: string, search?: string) {
    return useQuery({
        queryKey: ['pages', page, limit, customerId, search],
        queryFn: () => pagesApi.getAll(page, limit, customerId, search),
    });
}

export function usePage(id: string) {
    return useQuery({
        queryKey: ['pages', id],
        queryFn: () => pagesApi.getById(id),
        enabled: !!id,
    });
}

export function usePageElements(pageId: string) {
    return useQuery({
        queryKey: ['pages', pageId, 'elements'],
        queryFn: () => pagesApi.getElements(pageId),
        enabled: !!pageId,
    });
}

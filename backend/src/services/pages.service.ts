import { prisma } from '../config/prisma.js';
import type { PaginationParams } from '../types/index.js';

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
    isPublished?: boolean;
}

export interface UpdatePageElementDto {
    content: string;
}

export const pageService = {
    async findAll(pagination: PaginationParams, customerId?: string, search?: string) {
        const where: Record<string, unknown> = {};

        if (customerId) {
            where.customerId = customerId;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { slug: { contains: search } },
            ];
        }

        const [pages, total] = await Promise.all([
            prisma.page.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    template: {
                        select: { id: true, name: true, thumbnail: true },
                    },
                    customer: {
                        select: { id: true, name: true, email: true },
                    },
                    _count: {
                        select: { elements: true },
                    },
                },
            }),
            prisma.page.count({ where }),
        ]);

        return {
            pages,
            meta: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };
    },

    async findById(id: string) {
        const page = await prisma.page.findUnique({
            where: { id },
            include: {
                template: true,
                customer: {
                    select: { id: true, name: true, email: true },
                },
                elements: true,
            },
        });

        if (!page) {
            throw new Error('PAGE_NOT_FOUND');
        }

        return page;
    },

    async findBySlug(slug: string) {
        const page = await prisma.page.findUnique({
            where: { slug },
            include: {
                template: true,
                elements: true,
            },
        });

        if (!page) {
            throw new Error('PAGE_NOT_FOUND');
        }

        return page;
    },

    async createFromTemplate(data: CreatePageDto) {
        // Verify template exists
        const template = await prisma.template.findUnique({
            where: { id: data.templateId },
        });

        if (!template) {
            throw new Error('TEMPLATE_NOT_FOUND');
        }

        // Verify customer exists
        const customer = await prisma.customer.findUnique({
            where: { id: data.customerId },
        });

        if (!customer) {
            throw new Error('CUSTOMER_NOT_FOUND');
        }

        // Check slug uniqueness
        const existingPage = await prisma.page.findUnique({
            where: { slug: data.slug },
        });

        if (existingPage) {
            throw new Error('SLUG_ALREADY_EXISTS');
        }

        // Extract variables from template HTML
        const variableRegex = /\{\{(\w+)\}\}/g;
        const variables: Set<string> = new Set();
        let match;
        while ((match = variableRegex.exec(template.htmlContent)) !== null) {
            if (match[1]) {
                variables.add(match[1]);
            }
        }

        // Create page with elements in a transaction
        const page = await prisma.$transaction(async (tx) => {
            // Create the page
            const newPage = await tx.page.create({
                data: {
                    templateId: data.templateId,
                    customerId: data.customerId,
                    name: data.name,
                    slug: data.slug,
                    customCss: data.customCss,
                },
            });

            // Create elements for each variable
            if (variables.size > 0) {
                const elementsData = Array.from(variables).map((variable) => ({
                    pageId: newPage.id,
                    elementKey: variable,
                    type: this.inferElementType(variable),
                    content: this.getDefaultContent(variable),
                    label: this.formatLabel(variable),
                }));

                await tx.pageElement.createMany({
                    data: elementsData,
                });
            }

            // Return complete page with includes
            return tx.page.findUnique({
                where: { id: newPage.id },
                include: {
                    template: true,
                    customer: {
                        select: { id: true, name: true, email: true },
                    },
                    elements: true,
                },
            });
        });

        return page;
    },

    // Helper to infer element type from variable name
    inferElementType(variable: string): string {
        const lowerVar = variable.toLowerCase();
        if (lowerVar.includes('image') || lowerVar.includes('img') || lowerVar.includes('logo') || lowerVar.includes('photo')) {
            return 'IMAGE';
        }
        if (lowerVar.includes('color') || lowerVar.includes('bg') || lowerVar.includes('background')) {
            return 'COLOR';
        }
        if (lowerVar.includes('link') || lowerVar.includes('url') || lowerVar.includes('href')) {
            return 'LINK';
        }
        return 'TEXT';
    },

    // Helper to get default content based on type
    getDefaultContent(variable: string): string {
        const type = this.inferElementType(variable);
        switch (type) {
            case 'IMAGE':
                return 'https://placehold.co/600x400';
            case 'COLOR':
                return '#3B82F6';
            case 'LINK':
                return '#';
            default:
                return this.formatLabel(variable);
        }
    },

    // Helper to format variable name as label
    formatLabel(variable: string): string {
        return variable
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^\s+/, '')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    },

    async update(id: string, data: UpdatePageDto) {
        await this.findById(id); // Check if exists

        // If slug is being updated, check uniqueness
        if (data.slug) {
            const existingPage = await prisma.page.findFirst({
                where: {
                    slug: data.slug,
                    id: { not: id },
                },
            });

            if (existingPage) {
                throw new Error('SLUG_ALREADY_EXISTS');
            }
        }

        return prisma.page.update({
            where: { id },
            data,
            include: {
                template: true,
                customer: {
                    select: { id: true, name: true, email: true },
                },
                elements: true,
            },
        });
    },

    async delete(id: string) {
        await this.findById(id); // Check if exists

        return prisma.page.delete({
            where: { id },
        });
    },

    async publish(id: string) {
        return this.update(id, { isPublished: true });
    },

    async unpublish(id: string) {
        return this.update(id, { isPublished: false });
    },

    // Page Elements management
    async updateElement(pageId: string, elementKey: string, data: UpdatePageElementDto) {
        // Update or create element
        return prisma.pageElement.upsert({
            where: {
                pageId_elementKey: {
                    pageId,
                    elementKey,
                },
            },
            update: {
                content: data.content,
            },
            create: {
                pageId,
                elementKey,
                type: 'TEXT', // Default type
                content: data.content,
            },
        });
    },

    async createElement(pageId: string, elementKey: string, type: string, content: string, label?: string) {
        return prisma.pageElement.create({
            data: {
                pageId,
                elementKey,
                type,
                content,
                label,
            },
        });
    },

    async deleteElement(pageId: string, elementKey: string) {
        return prisma.pageElement.delete({
            where: {
                pageId_elementKey: {
                    pageId,
                    elementKey,
                },
            },
        });
    },

    async getElements(pageId: string) {
        return prisma.pageElement.findMany({
            where: { pageId },
            orderBy: { elementKey: 'asc' },
        });
    },
};

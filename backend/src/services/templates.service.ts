import { prisma } from '../config/prisma.js';
import type { PaginationParams } from '../types/index.js';

export interface CreateTemplateDto {
    name: string;
    description?: string;
    thumbnail?: string;
    htmlContent: string;
    cssContent?: string;
    isActive?: boolean;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> { }

export const templateService = {
    async findAll(pagination: PaginationParams, search?: string) {
        const where = search
            ? {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } },
                ],
            }
            : {};

        const [templates, total] = await Promise.all([
            prisma.template.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { pages: true },
                    },
                },
            }),
            prisma.template.count({ where }),
        ]);

        return {
            templates,
            meta: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };
    },

    async findById(id: string) {
        const template = await prisma.template.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { pages: true },
                },
            },
        });

        if (!template) {
            throw new Error('TEMPLATE_NOT_FOUND');
        }

        return template;
    },

    async create(data: CreateTemplateDto) {
        return prisma.template.create({
            data: {
                name: data.name,
                description: data.description,
                thumbnail: data.thumbnail,
                htmlContent: data.htmlContent,
                cssContent: data.cssContent,
                isActive: data.isActive ?? true,
            },
        });
    },

    async update(id: string, data: UpdateTemplateDto) {
        await this.findById(id); // Check if exists

        return prisma.template.update({
            where: { id },
            data,
        });
    },

    async delete(id: string) {
        await this.findById(id); // Check if exists

        // Check if template has pages
        const pagesCount = await prisma.page.count({
            where: { templateId: id },
        });

        if (pagesCount > 0) {
            throw new Error('TEMPLATE_HAS_PAGES');
        }

        return prisma.template.delete({
            where: { id },
        });
    },
};

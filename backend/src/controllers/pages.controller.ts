import { Request, Response } from 'express';
import { z } from 'zod';
import { pageService } from '../services/pages.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination } from '../middlewares/validation.middleware.js';
import type { ApiResponse } from '../types/index.js';

const createPageSchema = z.object({
    templateId: z.string().min(1, 'Template ID es requerido'),
    customerId: z.string().min(1, 'Customer ID es requerido'),
    name: z.string().min(1, 'El nombre es requerido'),
    slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9-]+$/, 'Slug solo puede contener letras minúsculas, números y guiones'),
    customCss: z.string().optional(),
});

const updatePageSchema = z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
    customCss: z.string().optional(),
    theme: z.string().optional(),
    isPublished: z.boolean().optional(),
});

const updateElementSchema = z.object({
    content: z.string(),
});

export const getAll = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const pagination = getPagination(req);
    const customerId = req.query.customerId as string | undefined;
    const search = req.query.search as string | undefined;
    const result = await pageService.findAll(pagination, customerId, search);

    res.json({
        success: true,
        data: result.pages,
        meta: result.meta,
    });
});

export const getById = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const page = await pageService.findById(req.params.id!);

    res.json({
        success: true,
        data: page,
    });
});

export const getBySlug = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const page = await pageService.findBySlug(req.params.slug!);

    res.json({
        success: true,
        data: page,
    });
});

export const create = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const data = createPageSchema.parse(req.body);
    const page = await pageService.createFromTemplate(data);

    res.status(201).json({
        success: true,
        data: page,
    });
});

export const update = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const data = updatePageSchema.parse(req.body);
    const page = await pageService.update(req.params.id!, data);

    res.json({
        success: true,
        data: page,
    });
});

export const remove = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    await pageService.delete(req.params.id!);

    res.json({
        success: true,
        data: { message: 'Página eliminada correctamente' },
    });
});

export const publish = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const page = await pageService.publish(req.params.id!);

    res.json({
        success: true,
        data: page,
    });
});

export const unpublish = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const page = await pageService.unpublish(req.params.id!);

    res.json({
        success: true,
        data: page,
    });
});

// Element endpoints
export const getElements = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const elements = await pageService.getElements(req.params.id!);

    res.json({
        success: true,
        data: elements,
    });
});

export const updateElement = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const data = updateElementSchema.parse(req.body);
    const element = await pageService.updateElement(
        req.params.id!,
        req.params.elementKey!,
        data
    );

    res.json({
        success: true,
        data: element,
    });
});

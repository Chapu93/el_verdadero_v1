import { Request, Response } from 'express';
import { z } from 'zod';
import { templateService } from '../services/templates.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination } from '../middlewares/validation.middleware.js';
import type { ApiResponse } from '../types/index.js';

const createTemplateSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().optional(),
    thumbnail: z.string().url().optional().or(z.literal('')),
    htmlContent: z.string().min(1, 'El contenido HTML es requerido'),
    cssContent: z.string().optional(),
    isActive: z.boolean().optional(),
});

const updateTemplateSchema = createTemplateSchema.partial();

export const getAll = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const pagination = getPagination(req);
    const search = req.query.search as string | undefined;
    const result = await templateService.findAll(pagination, search);

    res.json({
        success: true,
        data: result.templates,
        meta: result.meta,
    });
});

export const getById = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const template = await templateService.findById(req.params.id!);

    res.json({
        success: true,
        data: template,
    });
});

export const create = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const data = createTemplateSchema.parse(req.body);
    const template = await templateService.create({
        ...data,
        thumbnail: data.thumbnail || undefined,
    });

    res.status(201).json({
        success: true,
        data: template,
    });
});

export const update = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const data = updateTemplateSchema.parse(req.body);
    const template = await templateService.update(req.params.id!, data);

    res.json({
        success: true,
        data: template,
    });
});

export const remove = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    await templateService.delete(req.params.id!);

    res.json({
        success: true,
        data: { message: 'Plantilla eliminada correctamente' },
    });
});

import { Request, Response } from 'express';
import { z } from 'zod';
import { customerService } from '../services/customers.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination } from '../middlewares/validation.middleware.js';
import type { ApiResponse } from '../types/index.js';

const CustomerStatusValues = ['ACTIVE', 'PENDING', 'INACTIVE'] as const;

export const createCustomerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    avatar: z.string().url().optional().or(z.literal('')),
    status: z.enum(CustomerStatusValues).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const getAll = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const pagination = getPagination(req);
    const filters = {
        status: req.query.status as string | undefined,
        search: req.query.search as string | undefined,
    };

    const result = await customerService.findAll(pagination, filters);

    res.json({
        success: true,
        data: result.customers,
        meta: result.meta,
    });
});

export const getById = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const customer = await customerService.findById(req.params.id!);

    res.json({
        success: true,
        data: customer,
    });
});

export const create = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const data = createCustomerSchema.parse(req.body);
    const customer = await customerService.create(data);

    res.status(201).json({
        success: true,
        data: customer,
    });
});

export const update = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const data = updateCustomerSchema.parse(req.body);
    const customer = await customerService.update(req.params.id!, data);

    res.json({
        success: true,
        data: customer,
    });
});

export const remove = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    await customerService.delete(req.params.id!);

    res.json({
        success: true,
        data: { message: 'Customer deleted successfully' },
    });
});

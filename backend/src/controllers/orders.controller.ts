import { Request, Response } from 'express';
import { z } from 'zod';
import { orderService } from '../services/orders.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination } from '../middlewares/validation.middleware.js';
import type { ApiResponse } from '../types/index.js';

const OrderStatusValues = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const;

export const createOrderSchema = z.object({
    customerId: z.string().min(1, 'Customer ID is required'),
    total: z.number().positive('Total must be a positive number'),
    status: z.enum(OrderStatusValues).optional(),
});

export const updateOrderSchema = z.object({
    status: z.enum(OrderStatusValues).optional(),
    total: z.number().positive().optional(),
});

export const getAll = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const pagination = getPagination(req);
    const filters = {
        status: req.query.status as string | undefined,
        customerId: req.query.customerId as string | undefined,
    };

    const result = await orderService.findAll(pagination, filters);

    res.json({
        success: true,
        data: result.orders,
        meta: result.meta,
    });
});

export const getById = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const order = await orderService.findById(req.params.id!);

    res.json({
        success: true,
        data: order,
    });
});

export const create = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const data = createOrderSchema.parse(req.body);
    const order = await orderService.create(data);

    res.status(201).json({
        success: true,
        data: order,
    });
});

export const update = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const data = updateOrderSchema.parse(req.body);
    const order = await orderService.update(req.params.id!, data);

    res.json({
        success: true,
        data: order,
    });
});

export const remove = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    await orderService.delete(req.params.id!);

    res.json({
        success: true,
        data: { message: 'Order deleted successfully' },
    });
});

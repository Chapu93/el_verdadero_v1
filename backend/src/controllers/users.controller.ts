import { Request, Response } from 'express';
import { z } from 'zod';
import { userService } from '../services/users.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination } from '../middlewares/validation.middleware.js';
import type { ApiResponse, AuthenticatedRequest } from '../types/index.js';

export const updateUserSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const user = await userService.findById(req.user!.userId);

    res.json({
        success: true,
        data: user,
    });
});

export const getAll = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const pagination = getPagination(req);
    const result = await userService.findAll(pagination);

    res.json({
        success: true,
        data: result.users,
        meta: result.meta,
    });
});

export const getById = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const user = await userService.findById(req.params.id!);

    res.json({
        success: true,
        data: user,
    });
});

export const update = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const data = updateUserSchema.parse(req.body);
    // If no ID in params (for /me route), use authenticated user's ID
    const userId = req.params.id || req.user!.userId;
    const user = await userService.update(userId, data);

    res.json({
        success: true,
        data: user,
    });
});

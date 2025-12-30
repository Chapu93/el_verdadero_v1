import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { ApiResponse, AuthenticatedRequest } from '../types/index.js';

// Validation schemas
export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export const register = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);

    res.status(201).json({
        success: true,
        data: result,
    });
});

export const login = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    res.json({
        success: true,
        data: result,
    });
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const user = await authService.me(req.user!.userId);

    res.json({
        success: true,
        data: user,
    });
});

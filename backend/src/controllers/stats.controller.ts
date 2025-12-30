import { Request, Response } from 'express';
import { statsService } from '../services/stats.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { ApiResponse } from '../types/index.js';

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response<ApiResponse>) => {
    const stats = await statsService.getDashboardStats();

    res.json({
        success: true,
        data: stats,
    });
});

export const invalidateStatsCache = asyncHandler(async (_req: Request, res: Response<ApiResponse>) => {
    await statsService.invalidateCache();

    res.json({
        success: true,
        data: { message: 'Stats cache invalidated' },
    });
});

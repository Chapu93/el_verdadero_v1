import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import type { ApiResponse } from '../types/index.js';

export const errorHandler: ErrorRequestHandler = (
    err: Error,
    _req: Request,
    res: Response<ApiResponse>,
    _next: NextFunction
): void => {
    // Default error values
    let statusCode = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    // Handle known error types
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code;
    } else if (err instanceof ZodError) {
        statusCode = 400;
        message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        code = 'VALIDATION_ERROR';
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                statusCode = 409;
                message = 'A record with this value already exists';
                code = 'DUPLICATE_ENTRY';
                break;
            case 'P2025':
                statusCode = 404;
                message = 'Record not found';
                code = 'NOT_FOUND';
                break;
            default:
                statusCode = 400;
                message = 'Database operation failed';
                code = 'DATABASE_ERROR';
        }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Invalid data provided';
        code = 'VALIDATION_ERROR';
    }

    // Log error in development
    if (config.env === 'development') {
        console.error('❌ Error:', {
            message: err.message,
            stack: err.stack,
            statusCode,
            code,
        });
    }

    // Send response (never expose stack trace in production)
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code,
        },
    });
};

// Handle 404 - Route not found
export const notFoundHandler = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    next(new AppError(`Route ${req.method} ${req.path} not found`, 404, 'ROUTE_NOT_FOUND'));
};

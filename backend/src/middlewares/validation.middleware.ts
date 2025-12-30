import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError.js';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const dataToValidate = req[target];
            const validated = schema.parse(dataToValidate);

            // Replace with validated data (includes transformations)
            req[target] = validated;
            next();
        } catch (error) {
            next(error); // Let error middleware handle ZodError
        }
    };
};

// Utility to get pagination params
export const getPagination = (req: Request) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

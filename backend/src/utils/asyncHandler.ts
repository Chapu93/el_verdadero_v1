import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFunction = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>;

/**
 * Wrapper for async route handlers to catch errors and pass them to Express error handler
 */
export const asyncHandler = (fn: AsyncFunction): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

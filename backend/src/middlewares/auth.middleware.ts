import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import type { AuthenticatedRequest, JwtPayload } from '../types/index.js';

export const authMiddleware = (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw AppError.unauthorized('No token provided');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw AppError.unauthorized('No token provided');
        }

        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(AppError.unauthorized('Invalid token'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(AppError.unauthorized('Token expired'));
        } else {
            next(error);
        }
    }
};

// Optional: Role-based access control middleware
export const requireRole = (...roles: string[]) => {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            next(AppError.unauthorized());
            return;
        }

        if (!roles.includes(req.user.role)) {
            next(AppError.forbidden('Insufficient permissions'));
            return;
        }

        next();
    };
};

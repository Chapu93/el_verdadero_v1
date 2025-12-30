export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR'
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, AppError.prototype);
    }

    static badRequest(message: string = 'Bad request'): AppError {
        return new AppError(message, 400, 'BAD_REQUEST');
    }

    static unauthorized(message: string = 'Unauthorized'): AppError {
        return new AppError(message, 401, 'UNAUTHORIZED');
    }

    static forbidden(message: string = 'Forbidden'): AppError {
        return new AppError(message, 403, 'FORBIDDEN');
    }

    static notFound(message: string = 'Resource not found'): AppError {
        return new AppError(message, 404, 'NOT_FOUND');
    }

    static conflict(message: string = 'Resource already exists'): AppError {
        return new AppError(message, 409, 'CONFLICT');
    }

    static tooManyRequests(message: string = 'Too many requests'): AppError {
        return new AppError(message, 429, 'TOO_MANY_REQUESTS');
    }

    static internal(message: string = 'Internal server error'): AppError {
        return new AppError(message, 500, 'INTERNAL_ERROR');
    }
}

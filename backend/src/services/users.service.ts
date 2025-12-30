import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import type { UpdateUserDto, PaginationParams } from '../types/index.js';

export class UserService {
    async findAll(pagination: PaginationParams) {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip: pagination.skip,
                take: pagination.limit,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    bio: true,
                    avatar: true,
                    role: true,
                    subscription: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count(),
        ]);

        return {
            users,
            meta: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };
    }

    async findById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { subscription: true },
        });

        if (!user) {
            throw AppError.notFound('User not found');
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async update(id: string, data: UpdateUserDto) {
        const user = await prisma.user.update({
            where: { id },
            data,
            include: { subscription: true },
        });

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export const userService = new UserService();

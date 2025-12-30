import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import type { CreateOrderDto, UpdateOrderDto, PaginationParams } from '../types/index.js';

export class OrderService {
    async findAll(pagination: PaginationParams, filters?: { status?: string; customerId?: string }) {
        const where: { status?: string; customerId?: string } = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.customerId) {
            where.customerId = filters.customerId;
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { orderDate: 'desc' },
            }),
            prisma.order.count({ where }),
        ]);

        return {
            orders,
            meta: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };
    }

    async findById(id: string) {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                customer: true,
            },
        });

        if (!order) {
            throw AppError.notFound('Order not found');
        }

        return order;
    }

    async create(data: CreateOrderDto) {
        // Verify customer exists
        const customer = await prisma.customer.findUnique({
            where: { id: data.customerId },
        });

        if (!customer) {
            throw AppError.notFound('Customer not found');
        }

        // Generate order number
        const orderCount = await prisma.order.count();
        const orderNumber = `ORD-${String(orderCount + 1).padStart(4, '0')}`;

        return prisma.order.create({
            data: {
                orderNumber,
                customerId: data.customerId,
                total: data.total,
                status: data.status || 'PENDING',
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async update(id: string, data: UpdateOrderDto) {
        return prisma.order.update({
            where: { id },
            data,
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async delete(id: string) {
        await prisma.order.delete({
            where: { id },
        });
    }
}

export const orderService = new OrderService();

import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import type { CreateCustomerDto, UpdateCustomerDto, PaginationParams } from '../types/index.js';

export class CustomerService {
    async findAll(pagination: PaginationParams, filters?: { status?: string; search?: string }) {
        const where: { status?: string; OR?: Array<{ name?: { contains: string }; email?: { contains: string } }> } = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { email: { contains: filters.search } },
            ];
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                include: {
                    _count: { select: { orders: true } },
                },
                orderBy: { registrationDate: 'desc' },
            }),
            prisma.customer.count({ where }),
        ]);

        return {
            customers,
            meta: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        };
    }

    async findById(id: string) {
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                orders: {
                    orderBy: { orderDate: 'desc' },
                    take: 10,
                },
                _count: { select: { orders: true } },
            },
        });

        if (!customer) {
            throw AppError.notFound('Customer not found');
        }

        return customer;
    }

    async create(data: CreateCustomerDto) {
        return prisma.customer.create({
            data,
        });
    }

    async update(id: string, data: UpdateCustomerDto) {
        return prisma.customer.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        await prisma.customer.delete({
            where: { id },
        });
    }
}

export const customerService = new CustomerService();

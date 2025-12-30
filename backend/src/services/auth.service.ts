import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import type { CreateUserDto, LoginDto, JwtPayload } from '../types/index.js';

export class AuthService {
    async register(data: CreateUserDto) {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw AppError.conflict('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Create user with free subscription
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                subscription: {
                    create: {
                        plan: 'FREE',
                    },
                },
            },
            include: {
                subscription: true,
            },
        });

        // Generate token
        const token = this.generateToken(user);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    async login(data: LoginDto) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
            include: { subscription: true },
        });

        if (!user) {
            throw AppError.unauthorized('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw AppError.unauthorized('Invalid email or password');
        }

        // Generate token
        const token = this.generateToken(user);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    async me(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });

        if (!user) {
            throw AppError.notFound('User not found');
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    private generateToken(user: { id: string; email: string; role: string }): string {
        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role as JwtPayload['role'],
        };

        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
        });
    }
}

export const authService = new AuthService();

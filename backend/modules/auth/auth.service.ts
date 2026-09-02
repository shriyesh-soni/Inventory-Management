import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../../config/db';
import { config } from '../../config/env';
import { RegisterInput, LoginInput } from './auth.schemas';
import { AuthUser } from '../../middleware/auth';

export class AuthService {
  static async register(input: RegisterInput, currentUser?: AuthUser) {
    const requestedRole: Role = input.role ? (input.role as Role) : Role.STAFF;

    // Check if user count is 0 to allow initial MANAGER bootstrap
    const totalUsers = await prisma.user.count();

    if (requestedRole === Role.MANAGER && totalUsers > 0) {
      if (!currentUser || currentUser.role !== Role.MANAGER) {
        const error = new Error('Only managers can create other manager accounts');
        (error as any).statusCode = 403;
        throw error;
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      const error = new Error('A user with this email already exists');
      (error as any).statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        role: requestedRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      (error as any).statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      (error as any).statusCode = 401;
      throw error;
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ userId: user.id }, config.refreshTokenSecret, {
      expiresIn: '7d',
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  static async refresh(token: string) {
    try {
      const decoded = jwt.verify(token, config.refreshTokenSecret) as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        const error = new Error('User not found');
        (error as any).statusCode = 401;
        throw error;
      }

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: '15m' }
      );

      return { accessToken };
    } catch (err) {
      const error = new Error('Invalid or expired refresh token');
      (error as any).statusCode = 401;
      throw error;
    }
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        locationAssignments: {
          include: {
            location: true,
          },
        },
      },
    });

    if (!user) {
      const error = new Error('User not found');
      (error as any).statusCode = 404;
      throw error;
    }

    return user;
  }
}

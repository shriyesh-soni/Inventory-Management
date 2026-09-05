import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation Error',
      error: {
        message: 'Validation Error',
        statusCode: 400,
        details: err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
      res.status(409).json({
        message: `A record with this ${target} already exists.`,
        error: {
          message: `A record with this ${target} already exists.`,
          statusCode: 409,
        },
      });
      return;
    }

    if (err.code === 'P2003') {
      res.status(400).json({
        message: 'Referenced entity does not exist or has been modified. Please refresh and try again.',
        error: {
          message: 'Referenced entity does not exist or has been modified. Please refresh and try again.',
          statusCode: 400,
        },
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        message: 'Requested record was not found.',
        error: {
          message: 'Requested record was not found.',
          statusCode: 404,
        },
      });
      return;
    }
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode === 500) {
    console.error(`[Error] ${statusCode} - ${message}`);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    message,
    error: {
      message,
      statusCode,
    },
  });
};

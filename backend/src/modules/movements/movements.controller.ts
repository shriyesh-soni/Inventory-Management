import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { MovementsService } from './movements.service';
import { AuthenticatedRequest } from '../../../middleware/auth';

const receiptSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be a positive integer'),
});

const issueSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be a positive integer'),
});

const transferSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  sourceLocationId: z.string().min(1, 'Source location ID is required'),
  destinationLocationId: z.string().min(1, 'Destination location ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be a positive integer'),
});

const adjustmentSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  quantity: z.number().int('Quantity must be an integer'),
  reason: z.string().min(1, 'Reason is required for adjustments').trim(),
});

export class MovementsController {
  static async recordReceipt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = receiptSchema.parse(req.body);
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const movement = await MovementsService.recordReceipt(userId, userRole, parsed);
      res.status(201).json(movement);
    } catch (error) {
      next(error);
    }
  }

  static async recordIssue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = issueSchema.parse(req.body);
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const movement = await MovementsService.recordIssue(userId, userRole, parsed);
      res.status(201).json(movement);
    } catch (error) {
      next(error);
    }
  }

  static async recordTransfer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = transferSchema.parse(req.body);
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const movement = await MovementsService.recordTransfer(userId, userRole, parsed);
      res.status(201).json(movement);
    } catch (error) {
      next(error);
    }
  }

  static async recordAdjustment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = adjustmentSchema.parse(req.body);
      const userId = req.user!.userId;

      const movement = await MovementsService.recordAdjustment(userId, parsed);
      res.status(201).json(movement);
    } catch (error) {
      next(error);
    }
  }

  static async getItemMovements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const result = await MovementsService.getItemMovements(id, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

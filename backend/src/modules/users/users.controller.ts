import { Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { assignLocationSchema } from './users.schemas';
import { AuthenticatedRequest } from '../../middleware/auth';

export class UsersController {
  static async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UsersService.getAllUsers();
      res.status(200).json({ data: users });
    } catch (error) {
      next(error);
    }
  }

  static async assignLocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { locationId } = assignLocationSchema.parse(req.body);
      const assignment = await UsersService.assignLocation(userId, locationId);
      res.status(201).json({
        message: 'Staff assigned to location successfully',
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeLocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const locationId = req.params.locationId as string;
      const result = await UsersService.removeLocation(userId, locationId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async listStaffByLocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const locationId = req.params.locationId as string;
      const staff = await UsersService.getStaffByLocation(locationId);
      res.status(200).json({ data: staff });
    } catch (error) {
      next(error);
    }
  }
}

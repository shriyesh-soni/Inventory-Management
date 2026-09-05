import { Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { AuthenticatedRequest } from '../../../middleware/auth';

export class DashboardController {
  static async getSummaryStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await DashboardService.getSummaryStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getStockByCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const breakdown = await DashboardService.getStockByCategory();
      res.status(200).json(breakdown);
    } catch (error) {
      next(error);
    }
  }

  static async getStockByLocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const breakdown = await DashboardService.getStockByLocation();
      res.status(200).json(breakdown);
    } catch (error) {
      next(error);
    }
  }

  static async getMovementChart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const chart = await DashboardService.getMovementChart();
      res.status(200).json(chart);
    } catch (error) {
      next(error);
    }
  }
}

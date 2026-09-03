import { Response, NextFunction } from 'express';
import { AlertsService } from './alerts.service';
import { AuthenticatedRequest } from '../../middleware/auth';

export class AlertsController {
  static async listActiveAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const alerts = await AlertsService.listActiveAlerts();
      res.status(200).json(alerts);
    } catch (error) {
      next(error);
    }
  }

  static async dismissAlert(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const itemId = req.params.itemId as string;
      const alert = await AlertsService.dismissAlert(itemId);
      res.status(200).json(alert);
    } catch (error) {
      next(error);
    }
  }
}

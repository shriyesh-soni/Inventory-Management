import { Router } from 'express';
import { AlertsController } from './alerts.controller';
import { authenticate, requireRole } from '../../../middleware/auth';
import { Role } from '@prisma/client';

const alertsRouter = Router();

alertsRouter.use(authenticate);

// List active alerts
alertsRouter.get('/', AlertsController.listActiveAlerts);

// Dismiss alert (Manager only)
alertsRouter.patch('/:itemId/dismiss', requireRole(Role.MANAGER), AlertsController.dismissAlert);

export default alertsRouter;

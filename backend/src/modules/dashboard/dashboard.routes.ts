import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth';

const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get('/stats', DashboardController.getSummaryStats);
dashboardRouter.get('/stock-by-category', DashboardController.getStockByCategory);
dashboardRouter.get('/stock-by-location', DashboardController.getStockByLocation);
dashboardRouter.get('/movement-chart', DashboardController.getMovementChart);

export default dashboardRouter;

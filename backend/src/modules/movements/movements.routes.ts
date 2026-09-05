import { Router } from 'express';
import { MovementsController } from './movements.controller';
import { authenticate, requireRole } from '../../../middleware/auth';
import { Role } from '@prisma/client';

const movementsRouter = Router();

movementsRouter.use(authenticate);

// Receipts, Issues, Transfers (Staff with assignment or Manager)
movementsRouter.post('/receipt', MovementsController.recordReceipt);
movementsRouter.post('/issue', MovementsController.recordIssue);
movementsRouter.post('/transfer', MovementsController.recordTransfer);

// Adjustment (Manager only)
movementsRouter.post('/adjustment', requireRole(Role.MANAGER), MovementsController.recordAdjustment);

export default movementsRouter;

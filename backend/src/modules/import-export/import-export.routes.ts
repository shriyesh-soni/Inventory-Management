import { Router } from 'express';
import multer from 'multer';
import { ImportExportController } from './import-export.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const upload = multer({ storage: multer.memoryStorage() });

const importExportRouter = Router();

importExportRouter.use(authenticate);

// Import items (Manager only)
importExportRouter.post(
  '/import/items',
  requireRole(Role.MANAGER),
  upload.single('file'),
  ImportExportController.importItems
);

// Import stock receipts (Staff or Manager)
importExportRouter.post(
  '/import/receipts',
  upload.single('file'),
  ImportExportController.importReceipts
);

// Export current stock position
importExportRouter.get(
  '/export/stock',
  ImportExportController.exportStock
);

export default importExportRouter;

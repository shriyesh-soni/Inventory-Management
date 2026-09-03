import { Router } from 'express';
import { ItemsController } from './items.controller';
import { MovementsController } from '../movements/movements.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const itemsRouter = Router();

// Protect all routes with authentication
itemsRouter.use(authenticate);

// Public / Authenticated read routes (place specific paths before parameterized /:id)
itemsRouter.get('/', ItemsController.listItems);
itemsRouter.get('/reorder-suggestions', ItemsController.getReorderSuggestions);
itemsRouter.get('/sku/:sku', ItemsController.getItemBySku);
itemsRouter.get('/:id', ItemsController.getItemById);
itemsRouter.get('/:id/timeline', ItemsController.getItemTimeline);
itemsRouter.get('/:id/movements', MovementsController.getItemMovements);
itemsRouter.post('/:id/notes', ItemsController.addItemNote);

// Manager-only modification routes
itemsRouter.post('/', requireRole(Role.MANAGER), ItemsController.createItem);
itemsRouter.put('/:id', requireRole(Role.MANAGER), ItemsController.updateItem);
itemsRouter.patch('/:id/archive', requireRole(Role.MANAGER), ItemsController.archiveItem);
itemsRouter.patch('/:id/restore', requireRole(Role.MANAGER), ItemsController.restoreItem);

export default itemsRouter;

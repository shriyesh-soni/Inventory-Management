import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { authenticate, requireRole } from '../../../middleware/auth';
import { Role } from '@prisma/client';

const categoriesRouter = Router();

// GET /categories — accessible to all authenticated users
categoriesRouter.get('/', authenticate, CategoriesController.listCategories);

// Manager-only routes
categoriesRouter.post('/', authenticate, requireRole(Role.MANAGER), CategoriesController.createCategory);
categoriesRouter.put('/:id', authenticate, requireRole(Role.MANAGER), CategoriesController.updateCategory);
categoriesRouter.delete('/:id', authenticate, requireRole(Role.MANAGER), CategoriesController.deleteCategory);

export default categoriesRouter;

import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const usersRouter = Router();
const locationsStaffRouter = Router();

// Protect all user routes with authentication and MANAGER role requirement
usersRouter.use(authenticate, requireRole(Role.MANAGER));

usersRouter.get('/', UsersController.listUsers);
usersRouter.post('/:userId/locations', UsersController.assignLocation);
usersRouter.delete('/:userId/locations/:locationId', UsersController.removeLocation);

locationsStaffRouter.get(
  '/:locationId/staff',
  authenticate,
  requireRole(Role.MANAGER),
  UsersController.listStaffByLocation
);

export { usersRouter, locationsStaffRouter };

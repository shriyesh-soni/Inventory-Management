import { Router } from 'express';
import { LocationsController } from './locations.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const locationsRouter = Router();

// GET /locations — list all locations
locationsRouter.get('/', authenticate, LocationsController.listLocations);

// GET /locations/:id/stock — stock summary at location
locationsRouter.get('/:id/stock', authenticate, LocationsController.getLocationStock);

// POST /locations — create location (manager only)
locationsRouter.post('/', authenticate, requireRole(Role.MANAGER), LocationsController.createLocation);

export default locationsRouter;

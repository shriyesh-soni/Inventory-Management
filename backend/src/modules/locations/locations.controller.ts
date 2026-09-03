import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LocationsService } from './locations.service';

const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required').trim(),
});

export class LocationsController {
  static async listLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const locations = await LocationsService.listLocations();
      res.status(200).json(locations);
    } catch (error) {
      next(error);
    }
  }

  static async createLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = locationSchema.parse(req.body);
      const location = await LocationsService.createLocation(parsed.name);
      res.status(201).json(location);
    } catch (error) {
      next(error);
    }
  }

  static async getLocationStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const stock = await LocationsService.getLocationStock(id);
      res.status(200).json(stock);
    } catch (error) {
      next(error);
    }
  }
}

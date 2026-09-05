import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { ItemsService, ListItemsQuery } from './items.service';
import { AuthenticatedRequest } from '../../../middleware/auth';

const createItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required').trim(),
  name: z.string().min(1, 'Item name is required').trim(),
  description: z.string().trim().optional(),
  unit: z.string().min(1, 'Unit is required').trim(),
  reorderLevel: z.number().int().min(0, 'Reorder level must be a non-negative integer').optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  supplierId: z.string().optional(),
});

const updateItemSchema = createItemSchema.partial();

const addNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').trim(),
});

export class ItemsController {
  static async listItems(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: ListItemsQuery = {
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        locationId: req.query.locationId as string,
        archived: req.query.archived as string,
        belowReorder: req.query.belowReorder as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };

      const result = await ItemsService.listItems(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getReorderSuggestions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const suggestions = await ItemsService.getReorderSuggestions();
      res.status(200).json(suggestions);
    } catch (error) {
      next(error);
    }
  }

  static async getItemBySku(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sku = req.params.sku as string;
      const item = await ItemsService.getItemBySku(sku);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  static async getItemById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const item = await ItemsService.getItemById(id);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  static async createItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const parsed = createItemSchema.parse(req.body);
      const item = await ItemsService.createItem(userId, parsed);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const parsed = updateItemSchema.parse(req.body);
      const item = await ItemsService.updateItem(userId, id, parsed);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  static async archiveItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const item = await ItemsService.setArchiveState(userId, id, true);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  static async restoreItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const item = await ItemsService.setArchiveState(userId, id, false);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  static async getItemTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const timeline = await ItemsService.getItemTimeline(id);
      res.status(200).json(timeline);
    } catch (error) {
      next(error);
    }
  }

  static async addItemNote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const parsed = addNoteSchema.parse(req.body);
      const note = await ItemsService.addItemNote(userId, id, parsed.content);
      res.status(201).json(note);
    } catch (error) {
      next(error);
    }
  }
}

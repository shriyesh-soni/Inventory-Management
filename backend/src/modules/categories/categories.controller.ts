import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CategoriesService } from './categories.service';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
});

export class CategoriesController {
  static async listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CategoriesService.listCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = categorySchema.parse(req.body);
      const category = await CategoriesService.createCategory(parsed.name);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const parsed = categorySchema.parse(req.body);
      const category = await CategoriesService.updateCategory(id, parsed.name);
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await CategoriesService.deleteCategory(id);
      res.status(200).json({ message: 'Category deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

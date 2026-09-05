import { Response, NextFunction } from 'express';
import { ImportExportService } from './import-export.service';
import { AuthenticatedRequest } from '../../../middleware/auth';

export class ImportExportController {
  static async importItems(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No CSV file provided. Please upload a CSV file.' });
        return;
      }

      const userId = req.user!.userId;
      const result = await ImportExportService.importItemsFromCsv(req.file.buffer, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async importReceipts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No CSV file provided. Please upload a CSV file.' });
        return;
      }

      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const result = await ImportExportService.importReceiptsFromCsv(req.file.buffer, userId, userRole);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async exportStock(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const csvData = await ImportExportService.exportStockToCsv();
      const filename = `stock_export_${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}

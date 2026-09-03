import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { prisma } from '../../config/db';
import { MovementsService } from '../movements/movements.service';
import { calculateOnHandForItems } from '../items/items.utils';
import { Role } from '@prisma/client';

const itemCsvRowSchema = z.object({
  sku: z.string().min(1, 'SKU is required').trim(),
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().trim().optional(),
  unit: z.string().min(1, 'Unit is required').trim(),
  reorderLevel: z.coerce.number().int().min(0, 'Reorder level must be >= 0').default(0),
  category: z.string().min(1, 'Category is required').trim(),
});

const receiptCsvRowSchema = z.object({
  sku: z.string().min(1, 'SKU is required').trim(),
  locationName: z.string().min(1, 'Location name is required').trim(),
  quantity: z.coerce.number().int().min(1, 'Quantity must be > 0'),
});

export class ImportExportService {
  /**
   * Bulk import items from CSV buffer
   */
  static async importItemsFromCsv(fileBuffer: Buffer, userId: string) {
    const rawRecords = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let importedCount = 0;
    const failed: Array<{ row: number; data: any; reason: string }> = [];

    // Pre-fetch categories and existing SKUs for fast lookup
    const categories = await prisma.category.findMany();
    const categoryMap = new Map<string, string>();
    categories.forEach((c) => categoryMap.set(c.name.toLowerCase(), c.id));

    const existingItems = await prisma.item.findMany({ select: { sku: true } });
    const existingSkus = new Set(existingItems.map((i) => i.sku.toLowerCase()));

    for (let index = 0; index < rawRecords.length; index++) {
      const rowNum = index + 2; // Header is row 1
      const rawRow = rawRecords[index];

      try {
        const parsed = itemCsvRowSchema.parse(rawRow);

        if (existingSkus.has(parsed.sku.toLowerCase())) {
          failed.push({ row: rowNum, data: rawRow, reason: `SKU "${parsed.sku}" already exists.` });
          continue;
        }

        // Check or create Category
        let categoryId = categoryMap.get(parsed.category.toLowerCase());
        if (!categoryId) {
          const newCategory = await prisma.category.create({
            data: { name: parsed.category },
          });
          categoryId = newCategory.id;
          categoryMap.set(parsed.category.toLowerCase(), categoryId);
        }

        const newItem = await prisma.item.create({
          data: {
            sku: parsed.sku,
            name: parsed.name,
            description: parsed.description,
            unit: parsed.unit,
            reorderLevel: parsed.reorderLevel,
            categoryId,
          },
        });

        // Audit log entry
        await prisma.auditLog.create({
          data: {
            itemId: newItem.id,
            userId,
            field: null,
            oldValue: null,
            newValue: 'Imported via CSV',
          },
        });

        existingSkus.add(parsed.sku.toLowerCase());
        importedCount++;
      } catch (err: any) {
        const reason = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message;
        failed.push({ row: rowNum, data: rawRow, reason });
      }
    }

    return {
      imported: importedCount,
      failed,
    };
  }

  /**
   * Bulk import receipts from CSV buffer
   */
  static async importReceiptsFromCsv(fileBuffer: Buffer, userId: string, userRole: Role) {
    const rawRecords = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let importedCount = 0;
    const failed: Array<{ row: number; data: any; reason: string }> = [];

    // Pre-fetch items by SKU and locations by Name
    const items = await prisma.item.findMany({ select: { id: true, sku: true, isArchived: true } });
    const itemMap = new Map<string, { id: string; isArchived: boolean }>();
    items.forEach((i) => itemMap.set(i.sku.toLowerCase(), { id: i.id, isArchived: i.isArchived }));

    const locations = await prisma.location.findMany({ select: { id: true, name: true } });
    const locationMap = new Map<string, string>();
    locations.forEach((l) => locationMap.set(l.name.toLowerCase(), l.id));

    for (let index = 0; index < rawRecords.length; index++) {
      const rowNum = index + 2;
      const rawRow = rawRecords[index];

      try {
        const parsed = receiptCsvRowSchema.parse(rawRow);

        const item = itemMap.get(parsed.sku.toLowerCase());
        if (!item) {
          failed.push({ row: rowNum, data: rawRow, reason: `Item with SKU "${parsed.sku}" not found.` });
          continue;
        }

        if (item.isArchived) {
          failed.push({ row: rowNum, data: rawRow, reason: `Item with SKU "${parsed.sku}" is archived.` });
          continue;
        }

        const locationId = locationMap.get(parsed.locationName.toLowerCase());
        if (!locationId) {
          failed.push({ row: rowNum, data: rawRow, reason: `Location "${parsed.locationName}" not found.` });
          continue;
        }

        await MovementsService.recordReceipt(userId, userRole, {
          itemId: item.id,
          locationId,
          quantity: parsed.quantity,
        });

        importedCount++;
      } catch (err: any) {
        const reason = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message;
        failed.push({ row: rowNum, data: rawRow, reason });
      }
    }

    return {
      imported: importedCount,
      failed,
    };
  }

  /**
   * Export current stock position as CSV string
   */
  static async exportStockToCsv(): Promise<string> {
    const items = await prisma.item.findMany({
      where: { isArchived: false },
      include: { category: true },
    });

    const itemIds = items.map((i) => i.id);
    const stockMap = await calculateOnHandForItems(itemIds);

    const rows: string[] = ['sku,name,category,locationName,onHand'];

    for (const item of items) {
      const stock = stockMap.get(item.id);
      if (stock) {
        for (const loc of stock.locations) {
          if (loc.onHand > 0) {
            const escapedSku = `"${item.sku.replace(/"/g, '""')}"`;
            const escapedName = `"${item.name.replace(/"/g, '""')}"`;
            const escapedCategory = `"${item.category.name.replace(/"/g, '""')}"`;
            const escapedLocName = `"${(loc.locationName || '').replace(/"/g, '""')}"`;

            rows.push(`${escapedSku},${escapedName},${escapedCategory},${escapedLocName},${loc.onHand}`);
          }
        }
      }
    }

    return rows.join('\n');
  }
}

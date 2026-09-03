import { prisma } from '../../config/db';
import { calculateOnHandForItems, ItemStockSummary } from './items.utils';
import { Prisma } from '@prisma/client';

export interface ListItemsQuery {
  search?: string;
  categoryId?: string;
  locationId?: string;
  archived?: string;
  belowReorder?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class ItemsService {
  static async listItems(query: ListItemsQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {};

    // Search filter
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    // Archived filter (default false if not explicitly set to 'true')
    if (query.archived === 'true') {
      where.isArchived = true;
    } else if (query.archived === 'false' || !query.archived) {
      where.isArchived = false;
    }

    // Sort column and order
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const allowedSortFields = ['name', 'sku', 'reorderLevel', 'createdAt', 'updatedAt'];
    const orderBy: Prisma.ItemOrderByWithRelationInput = allowedSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' };

    // Fetch matching items
    const rawItems = await prisma.item.findMany({
      where,
      include: {
        category: true,
        supplier: true,
      },
      orderBy,
    });

    const itemIds = rawItems.map((i) => i.id);
    const stockMap = await calculateOnHandForItems(itemIds);

    let itemsWithStock = rawItems.map((item) => {
      const stock = stockMap.get(item.id) || { totalOnHand: 0, locations: [] };
      return {
        ...item,
        totalOnHand: stock.totalOnHand,
        locations: stock.locations,
      };
    });

    // Filter by locationId if provided
    if (query.locationId) {
      itemsWithStock = itemsWithStock.filter((item) =>
        item.locations.some((loc) => loc.locationId === query.locationId && loc.onHand > 0)
      );
    }

    // Filter by belowReorder if provided
    if (query.belowReorder === 'true') {
      itemsWithStock = itemsWithStock.filter((item) => item.totalOnHand <= item.reorderLevel);
    }

    const total = itemsWithStock.length;
    const paginatedItems = itemsWithStock.slice(skip, skip + limit);

    return {
      data: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getItemById(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
      },
    });

    if (!item) {
      const error: any = new Error('Item not found.');
      error.statusCode = 404;
      throw error;
    }

    const stockMap = await calculateOnHandForItems([id]);
    const stock = stockMap.get(id) || { totalOnHand: 0, locations: [] };

    return {
      ...item,
      totalOnHand: stock.totalOnHand,
      locations: stock.locations,
    };
  }

  static async getItemBySku(sku: string) {
    const item = await prisma.item.findUnique({
      where: { sku },
      include: {
        category: true,
        supplier: true,
      },
    });

    if (!item) {
      const error: any = new Error(`Item with SKU "${sku}" not found.`);
      error.statusCode = 404;
      throw error;
    }

    const stockMap = await calculateOnHandForItems([item.id]);
    const stock = stockMap.get(item.id) || { totalOnHand: 0, locations: [] };

    return {
      ...item,
      totalOnHand: stock.totalOnHand,
      locations: stock.locations,
    };
  }

  static async createItem(userId: string, data: {
    sku: string;
    name: string;
    description?: string;
    unit: string;
    reorderLevel?: number;
    categoryId: string;
    supplierId?: string;
  }) {
    // Check SKU uniqueness
    const existingSku = await prisma.item.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      const error: any = new Error('Item with this SKU already exists.');
      error.statusCode = 409;
      throw error;
    }

    // Verify category existence
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      const error: any = new Error('Invalid categoryId provided.');
      error.statusCode = 400;
      throw error;
    }

    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId },
      });
      if (!supplier) {
        const error: any = new Error('Invalid supplierId provided.');
        error.statusCode = 400;
        throw error;
      }
    }

    const item = await prisma.item.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        unit: data.unit,
        reorderLevel: data.reorderLevel ?? 0,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    // Write audit log entry for creation
    await prisma.auditLog.create({
      data: {
        itemId: item.id,
        userId,
        field: null,
        oldValue: null,
        newValue: null,
      },
    });

    return {
      ...item,
      totalOnHand: 0,
      locations: [],
    };
  }

  static async updateItem(userId: string, id: string, data: {
    sku?: string;
    name?: string;
    description?: string;
    unit?: string;
    reorderLevel?: number;
    categoryId?: string;
    supplierId?: string;
  }) {
    const existingItem = await prisma.item.findUnique({
      where: { id },
    });

    if (!existingItem) {
      const error: any = new Error('Item not found.');
      error.statusCode = 404;
      throw error;
    }

    if (data.sku && data.sku !== existingItem.sku) {
      const duplicateSku = await prisma.item.findUnique({
        where: { sku: data.sku },
      });
      if (duplicateSku) {
        const error: any = new Error('Item with this SKU already exists.');
        error.statusCode = 409;
        throw error;
      }
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        const error: any = new Error('Invalid categoryId provided.');
        error.statusCode = 400;
        throw error;
      }
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data,
      include: {
        category: true,
        supplier: true,
      },
    });

    // Track field changes for AuditLog
    const fieldsToTrack: (keyof typeof data)[] = ['sku', 'name', 'description', 'unit', 'reorderLevel', 'categoryId', 'supplierId'];
    const auditEntries = [];

    for (const field of fieldsToTrack) {
      if (data[field] !== undefined) {
        const oldVal = (existingItem as any)[field];
        const newVal = (updatedItem as any)[field];

        if (String(oldVal ?? '') !== String(newVal ?? '')) {
          auditEntries.push({
            itemId: id,
            userId,
            field,
            oldValue: oldVal != null ? String(oldVal) : null,
            newValue: newVal != null ? String(newVal) : null,
          });
        }
      }
    }

    if (auditEntries.length > 0) {
      await prisma.auditLog.createMany({
        data: auditEntries,
      });
    }

    const stockMap = await calculateOnHandForItems([id]);
    const stock = stockMap.get(id) || { totalOnHand: 0, locations: [] };

    return {
      ...updatedItem,
      totalOnHand: stock.totalOnHand,
      locations: stock.locations,
    };
  }

  static async setArchiveState(userId: string, id: string, isArchived: boolean) {
    const existingItem = await prisma.item.findUnique({
      where: { id },
    });

    if (!existingItem) {
      const error: any = new Error('Item not found.');
      error.statusCode = 404;
      throw error;
    }

    if (existingItem.isArchived === isArchived) {
      return this.getItemById(id);
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: { isArchived },
      include: {
        category: true,
        supplier: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        itemId: id,
        userId,
        field: 'isArchived',
        oldValue: String(existingItem.isArchived),
        newValue: String(isArchived),
      },
    });

    const stockMap = await calculateOnHandForItems([id]);
    const stock = stockMap.get(id) || { totalOnHand: 0, locations: [] };

    return {
      ...updatedItem,
      totalOnHand: stock.totalOnHand,
      locations: stock.locations,
    };
  }

  static async getItemTimeline(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      const error: any = new Error('Item not found.');
      error.statusCode = 404;
      throw error;
    }

    const [auditLogs, notes] = await Promise.all([
      prisma.auditLog.findMany({
        where: { itemId: id },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.itemNote.findMany({
        where: { itemId: id },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
    ]);

    const formattedAuditLogs = auditLogs.map((log) => ({
      type: 'AUDIT_LOG' as const,
      id: log.id,
      itemId: log.itemId,
      userId: log.userId,
      user: log.user,
      field: log.field,
      oldValue: log.oldValue,
      newValue: log.newValue,
      createdAt: log.createdAt,
    }));

    const formattedNotes = notes.map((note) => ({
      type: 'NOTE' as const,
      id: note.id,
      itemId: note.itemId,
      userId: note.userId,
      user: note.user,
      content: note.content,
      createdAt: note.createdAt,
    }));

    const mergedTimeline = [...formattedAuditLogs, ...formattedNotes].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return mergedTimeline;
  }

  static async addItemNote(userId: string, itemId: string, content: string) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      const error: any = new Error('Item not found.');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.itemNote.create({
      data: {
        itemId,
        userId,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  static async getReorderSuggestions() {
    const items = await prisma.item.findMany({
      where: { isArchived: false },
      include: {
        category: true,
        supplier: true,
      },
    });

    const itemIds = items.map((i) => i.id);
    const stockMap = await calculateOnHandForItems(itemIds);

    const suggestions = [];

    for (const item of items) {
      const stock = stockMap.get(item.id) || { totalOnHand: 0, locations: [] };
      if (stock.totalOnHand <= item.reorderLevel) {
        const suggestedOrderQty = Math.max(0, item.reorderLevel * 2 - stock.totalOnHand);
        suggestions.push({
          ...item,
          totalOnHand: stock.totalOnHand,
          locations: stock.locations,
          suggestedOrderQty,
        });
      }
    }

    return suggestions;
  }
}

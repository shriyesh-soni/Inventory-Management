import { prisma } from '../../config/db';
import { calculateOnHandForItems } from '../items/items.utils';

export class AlertsService {
  /**
   * Re-evaluates low stock alert status for a given item after any movement or item update.
   */
  static async reevaluateAlert(itemId: string): Promise<void> {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    const existingAlert = await prisma.lowStockAlert.findUnique({
      where: { itemId },
    });

    if (!item || item.isArchived) {
      if (existingAlert) {
        await prisma.lowStockAlert.delete({
          where: { itemId },
        });
      }
      return;
    }

    const stockMap = await calculateOnHandForItems([itemId]);
    const stock = stockMap.get(itemId);
    const totalOnHand = stock ? stock.totalOnHand : 0;

    if (totalOnHand <= item.reorderLevel) {
      if (!existingAlert) {
        await prisma.lowStockAlert.create({
          data: {
            itemId,
            lastTriggeredQuantity: totalOnHand,
            dismissedAt: null,
          },
        });
      } else {
        // If reorder level was increased above on-hand, or stock dropped further, re-activate
        await prisma.lowStockAlert.update({
          where: { itemId },
          data: {
            lastTriggeredQuantity: totalOnHand,
          },
        });
      }
    } else {
      // Stock is above reorder level: remove alert so future drops re-trigger cleanly
      if (existingAlert) {
        await prisma.lowStockAlert.delete({
          where: { itemId },
        });
      }
    }
  }

  /**
   * Synchronizes all active items with the alerts table.
   */
  static async syncAllAlerts(): Promise<void> {
    const items = await prisma.item.findMany({
      where: { isArchived: false },
    });
    if (items.length === 0) return;

    const itemIds = items.map((i) => i.id);
    const stockMap = await calculateOnHandForItems(itemIds);
    const existingAlerts = await prisma.lowStockAlert.findMany();
    const alertsMap = new Map(existingAlerts.map((a) => [a.itemId, a]));

    for (const item of items) {
      const stock = stockMap.get(item.id)?.totalOnHand ?? 0;
      const alert = alertsMap.get(item.id);

      if (stock <= item.reorderLevel) {
        if (!alert) {
          await prisma.lowStockAlert.create({
            data: {
              itemId: item.id,
              lastTriggeredQuantity: stock,
              dismissedAt: null,
            },
          });
        }
      } else if (alert) {
        await prisma.lowStockAlert.delete({
          where: { itemId: item.id },
        });
      }
    }
  }

  /**
   * List all active alerts (where dismissedAt is null)
   */
  static async listActiveAlerts() {
    await this.syncAllAlerts();

    const alerts = await prisma.lowStockAlert.findMany({
      where: {
        dismissedAt: null,
        item: {
          isArchived: false,
        },
      },
      include: {
        item: {
          include: {
            category: true,
            supplier: true,
          },
        },
      },
      orderBy: { lastTriggeredQuantity: 'asc' },
    });

    const itemIds = alerts.map((a) => a.itemId);
    const stockMap = await calculateOnHandForItems(itemIds);

    const data = alerts.map((alert) => {
      const stock = stockMap.get(alert.itemId) || { totalOnHand: 0, locations: [] };
      return {
        ...alert,
        currentOnHand: stock.totalOnHand,
        locations: stock.locations,
      };
    });

    return {
      data,
      activeCount: data.length,
    };
  }

  /**
   * Dismiss an active alert by setting dismissedAt to current timestamp
   */
  static async dismissAlert(itemId: string) {
    const alert = await prisma.lowStockAlert.findUnique({
      where: { itemId },
    });

    if (!alert) {
      const error: any = new Error('Low stock alert not found for this item.');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.lowStockAlert.update({
      where: { itemId },
      data: {
        dismissedAt: new Date(),
      },
    });
  }
}

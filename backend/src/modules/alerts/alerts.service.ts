import { prisma } from '../../config/db';
import { calculateOnHandForItems } from '../items/items.utils';

export class AlertsService {
  /**
   * Re-evaluates low stock alert status for a given item after any movement.
   */
  static async reevaluateAlert(itemId: string): Promise<void> {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item || item.isArchived) {
      return;
    }

    const stockMap = await calculateOnHandForItems([itemId]);
    const stock = stockMap.get(itemId);
    const totalOnHand = stock ? stock.totalOnHand : 0;

    const existingAlert = await prisma.lowStockAlert.findUnique({
      where: { itemId },
    });

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
        // If alert was dismissed, re-trigger it by setting dismissedAt to null
        await prisma.lowStockAlert.update({
          where: { itemId },
          data: {
            dismissedAt: null,
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
   * List all active alerts (where dismissedAt is null)
   */
  static async listActiveAlerts() {
    const alerts = await prisma.lowStockAlert.findMany({
      where: {
        dismissedAt: null,
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

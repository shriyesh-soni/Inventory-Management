import { prisma } from '../../config/db';
import { calculateOnHandForItems } from '../items/items.utils';

export class DashboardService {
  /**
   * Summary stats for dashboard KPI cards
   */
  static async getSummaryStats() {
    // 1. Active items count
    const activeItemsCount = await prisma.item.count({
      where: { isArchived: false },
    });

    // 2. Fetch all active items to compute items below reorder
    const items = await prisma.item.findMany({
      where: { isArchived: false },
      select: { id: true, reorderLevel: true },
    });

    const itemIds = items.map((i) => i.id);
    const stockMap = await calculateOnHandForItems(itemIds);

    let itemsBelowReorder = 0;
    for (const item of items) {
      const stock = stockMap.get(item.id);
      const totalOnHand = stock ? stock.totalOnHand : 0;
      if (totalOnHand <= item.reorderLevel) {
        itemsBelowReorder++;
      }
    }

    // 3. Movements today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const movementsToday = await prisma.stockMovement.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    // 4. Distinct items moved in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMovements = await prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        itemId: true,
      },
    });

    const distinctItemsThisWeek = new Set(recentMovements.map((m) => m.itemId)).size;

    return {
      activeItems: activeItemsCount,
      itemsBelowReorder,
      movementsToday,
      distinctItemsThisWeek,
    };
  }

  /**
   * Stock breakdown by category
   */
  static async getStockByCategory() {
    const categories = await prisma.category.findMany({
      include: {
        items: {
          where: { isArchived: false },
          select: { id: true },
        },
      },
    });

    const allActiveItems = await prisma.item.findMany({
      where: { isArchived: false },
      select: { id: true, categoryId: true },
    });

    const itemIds = allActiveItems.map((i) => i.id);
    const stockMap = await calculateOnHandForItems(itemIds);

    const categoryBreakdown = categories.map((cat) => {
      let totalStock = 0;
      for (const item of cat.items) {
        const stock = stockMap.get(item.id);
        if (stock) {
          totalStock += Math.max(0, stock.totalOnHand);
        }
      }

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        totalStock,
        itemCount: cat.items.length,
      };
    });

    categoryBreakdown.sort((a, b) => b.totalStock - a.totalStock);

    return categoryBreakdown;
  }

  /**
   * Stock breakdown by location
   */
  static async getStockByLocation() {
    const locations = await prisma.location.findMany();
    const movements = await prisma.stockMovement.findMany();

    // Map locationId -> itemId -> qty
    const locationStockMap = new Map<string, Map<string, number>>();
    for (const loc of locations) {
      locationStockMap.set(loc.id, new Map<string, number>());
    }

    for (const m of movements) {
      if (m.kind === 'RECEIPT') {
        const locMap = locationStockMap.get(m.locationId);
        if (locMap) locMap.set(m.itemId, (locMap.get(m.itemId) || 0) + m.quantity);
      } else if (m.kind === 'ISSUE') {
        const locMap = locationStockMap.get(m.locationId);
        if (locMap) locMap.set(m.itemId, (locMap.get(m.itemId) || 0) - m.quantity);
      } else if (m.kind === 'ADJUSTMENT') {
        const locMap = locationStockMap.get(m.locationId);
        if (locMap) locMap.set(m.itemId, (locMap.get(m.itemId) || 0) + m.quantity);
      } else if (m.kind === 'TRANSFER') {
        if (m.sourceLocationId) {
          const locMap = locationStockMap.get(m.sourceLocationId);
          if (locMap) locMap.set(m.itemId, (locMap.get(m.itemId) || 0) - m.quantity);
        }
        if (m.destinationLocationId) {
          const locMap = locationStockMap.get(m.destinationLocationId);
          if (locMap) locMap.set(m.itemId, (locMap.get(m.itemId) || 0) + m.quantity);
        }
      }
    }

    const locationBreakdown = locations.map((loc) => {
      const itemMap = locationStockMap.get(loc.id);
      let totalStock = 0;
      let itemCount = 0;

      if (itemMap) {
        for (const qty of itemMap.values()) {
          if (qty > 0) {
            totalStock += qty;
            itemCount++;
          }
        }
      }

      return {
        locationId: loc.id,
        locationName: loc.name,
        totalStock,
        itemCount,
      };
    });

    locationBreakdown.sort((a, b) => b.totalStock - a.totalStock);

    return locationBreakdown;
  }

  /**
   * Receipt/issue volume chart for the last 8 weeks
   */
  static async getMovementChart() {
    const weeks = 8;
    const now = new Date();

    const chartBuckets = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      weekEnd.setHours(23, 59, 59, 999);

      const movements = await prisma.stockMovement.findMany({
        where: {
          createdAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      });

      let receipts = 0;
      let issues = 0;

      for (const m of movements) {
        if (m.kind === 'RECEIPT') {
          receipts += m.quantity;
        } else if (m.kind === 'ISSUE') {
          issues += m.quantity;
        }
      }

      const startMonth = weekStart.toLocaleString('default', { month: 'short' });
      const startDate = weekStart.getDate();
      const endDate = weekEnd.getDate();

      chartBuckets.push({
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        label: `${startMonth} ${startDate} - ${endDate}`,
        receipts,
        issues,
      });
    }

    return chartBuckets;
  }
}

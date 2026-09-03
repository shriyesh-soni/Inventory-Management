import { prisma } from '../../config/db';

export class LocationsService {
  static async listLocations() {
    return await prisma.location.findMany({
      include: {
        _count: {
          select: {
            assignments: true,
            movements: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async createLocation(name: string) {
    const existing = await prisma.location.findUnique({
      where: { name },
    });

    if (existing) {
      const error: any = new Error('Location with this name already exists.');
      error.statusCode = 409;
      throw error;
    }

    return await prisma.location.create({
      data: { name },
    });
  }

  static async getLocationStock(locationId: string) {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      const error: any = new Error('Location not found.');
      error.statusCode = 404;
      throw error;
    }

    // Fetch movements related to this location
    const movements = await prisma.stockMovement.findMany({
      where: {
        OR: [
          { locationId },
          { sourceLocationId: locationId },
          { destinationLocationId: locationId },
        ],
      },
      include: {
        item: {
          include: {
            category: true,
            supplier: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate onHand per item at this location
    const itemStockMap = new Map<string, { item: any; onHand: number }>();

    for (const m of movements) {
      if (!itemStockMap.has(m.itemId)) {
        itemStockMap.set(m.itemId, { item: m.item, onHand: 0 });
      }

      const entry = itemStockMap.get(m.itemId)!;

      if (m.kind === 'RECEIPT' && m.locationId === locationId) {
        entry.onHand += m.quantity;
      } else if (m.kind === 'ISSUE' && m.locationId === locationId) {
        entry.onHand -= m.quantity;
      } else if (m.kind === 'ADJUSTMENT' && m.locationId === locationId) {
        entry.onHand += m.quantity;
      } else if (m.kind === 'TRANSFER') {
        if (m.sourceLocationId === locationId) {
          entry.onHand -= m.quantity;
        }
        if (m.destinationLocationId === locationId) {
          entry.onHand += m.quantity;
        }
      }
    }

    // Convert map to array and filter non-zero stock (or return items with stock details)
    const result = Array.from(itemStockMap.values())
      .filter((entry) => entry.onHand !== 0)
      .map((entry) => ({
        ...entry.item,
        onHand: entry.onHand,
      }));

    return result;
  }
}

import { prisma } from '../../config/db';
import { Role } from '@prisma/client';
import { AlertsService } from '../alerts/alerts.service';

export class MovementsService {
  /**
   * Internal helper: Calculate on-hand stock for an item at a specific location
   */
  static async getOnHandByLocation(itemId: string, locationId: string): Promise<number> {
    const movements = await prisma.stockMovement.findMany({
      where: {
        itemId,
        OR: [
          { locationId },
          { sourceLocationId: locationId },
          { destinationLocationId: locationId },
        ],
      },
    });

    let onHand = 0;
    for (const m of movements) {
      if (m.kind === 'RECEIPT' && m.locationId === locationId) {
        onHand += m.quantity;
      } else if (m.kind === 'ISSUE' && m.locationId === locationId) {
        onHand -= m.quantity;
      } else if (m.kind === 'ADJUSTMENT' && m.locationId === locationId) {
        onHand += m.quantity;
      } else if (m.kind === 'TRANSFER') {
        if (m.sourceLocationId === locationId) {
          onHand -= m.quantity;
        }
        if (m.destinationLocationId === locationId) {
          onHand += m.quantity;
        }
      }
    }

    return onHand;
  }

  /**
   * Internal helper: Check if staff is assigned to a specific location
   */
  private static async checkLocationAssignment(userId: string, userRole: Role, locationId: string) {
    if (userRole === Role.MANAGER) {
      return; // Managers have access to all locations
    }

    const assignment = await prisma.locationAssignment.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    });

    if (!assignment) {
      const error: any = new Error('Access forbidden. You are not assigned to this location.');
      error.statusCode = 403;
      throw error;
    }
  }

  /**
   * Internal helper: Validate item exist and is not archived
   */
  private static async validateItemActive(itemId: string) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      const error: any = new Error('Item not found.');
      error.statusCode = 404;
      throw error;
    }

    if (item.isArchived) {
      const error: any = new Error('Cannot record movements for an archived item.');
      error.statusCode = 400;
      throw error;
    }

    return item;
  }

  /**
   * Record a receipt movement
   */
  static async recordReceipt(
    userId: string,
    userRole: Role,
    data: { itemId: string; locationId: string; quantity: number }
  ) {
    if (data.quantity <= 0) {
      const error: any = new Error('Quantity must be greater than 0.');
      error.statusCode = 400;
      throw error;
    }

    await this.checkLocationAssignment(userId, userRole, data.locationId);
    await this.validateItemActive(data.itemId);

    const location = await prisma.location.findUnique({ where: { id: data.locationId } });
    if (!location) {
      const error: any = new Error('Location not found.');
      error.statusCode = 404;
      throw error;
    }

    const movement = await prisma.stockMovement.create({
      data: {
        itemId: data.itemId,
        kind: 'RECEIPT',
        quantity: data.quantity,
        locationId: data.locationId,
        recordedById: userId,
      },
      include: {
        item: true,
        location: true,
        recordedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Re-evaluate alert state after movement
    await AlertsService.reevaluateAlert(data.itemId);

    return movement;
  }

  /**
   * Record an issue movement
   */
  static async recordIssue(
    userId: string,
    userRole: Role,
    data: { itemId: string; locationId: string; quantity: number }
  ) {
    if (data.quantity <= 0) {
      const error: any = new Error('Quantity must be greater than 0.');
      error.statusCode = 400;
      throw error;
    }

    await this.checkLocationAssignment(userId, userRole, data.locationId);
    await this.validateItemActive(data.itemId);

    const location = await prisma.location.findUnique({ where: { id: data.locationId } });
    if (!location) {
      const error: any = new Error('Location not found.');
      error.statusCode = 404;
      throw error;
    }

    const onHand = await this.getOnHandByLocation(data.itemId, data.locationId);
    if (onHand < data.quantity) {
      const error: any = new Error(
        `Insufficient stock at location "${location.name}". Available: ${onHand}, requested: ${data.quantity}.`
      );
      error.statusCode = 400;
      throw error;
    }

    const movement = await prisma.stockMovement.create({
      data: {
        itemId: data.itemId,
        kind: 'ISSUE',
        quantity: data.quantity,
        locationId: data.locationId,
        recordedById: userId,
      },
      include: {
        item: true,
        location: true,
        recordedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    await AlertsService.reevaluateAlert(data.itemId);

    return movement;
  }

  /**
   * Record a transfer movement
   */
  static async recordTransfer(
    userId: string,
    userRole: Role,
    data: { itemId: string; sourceLocationId: string; destinationLocationId: string; quantity: number }
  ) {
    if (data.quantity <= 0) {
      const error: any = new Error('Quantity must be greater than 0.');
      error.statusCode = 400;
      throw error;
    }

    if (data.sourceLocationId === data.destinationLocationId) {
      const error: any = new Error('Source and destination locations must be different.');
      error.statusCode = 400;
      throw error;
    }

    await this.checkLocationAssignment(userId, userRole, data.sourceLocationId);
    await this.validateItemActive(data.itemId);

    const sourceLoc = await prisma.location.findUnique({ where: { id: data.sourceLocationId } });
    const destLoc = await prisma.location.findUnique({ where: { id: data.destinationLocationId } });

    if (!sourceLoc || !destLoc) {
      const error: any = new Error('Source or destination location not found.');
      error.statusCode = 404;
      throw error;
    }

    const sourceOnHand = await this.getOnHandByLocation(data.itemId, data.sourceLocationId);
    if (sourceOnHand < data.quantity) {
      const error: any = new Error(
        `Insufficient stock at source location "${sourceLoc.name}". Available: ${sourceOnHand}, requested: ${data.quantity}.`
      );
      error.statusCode = 400;
      throw error;
    }

    // Atomic Prisma transaction
    const movement = await prisma.$transaction(async (tx) => {
      return await tx.stockMovement.create({
        data: {
          itemId: data.itemId,
          kind: 'TRANSFER',
          quantity: data.quantity,
          locationId: data.sourceLocationId,
          sourceLocationId: data.sourceLocationId,
          destinationLocationId: data.destinationLocationId,
          recordedById: userId,
        },
        include: {
          item: true,
          location: true,
          recordedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });
    });

    await AlertsService.reevaluateAlert(data.itemId);

    return movement;
  }

  /**
   * Record an adjustment movement (Manager only)
   */
  static async recordAdjustment(
    userId: string,
    data: { itemId: string; locationId: string; quantity: number; reason: string }
  ) {
    if (!data.reason || data.reason.trim().length === 0) {
      const error: any = new Error('Reason is required for inventory adjustments.');
      error.statusCode = 400;
      throw error;
    }

    await this.validateItemActive(data.itemId);

    const location = await prisma.location.findUnique({ where: { id: data.locationId } });
    if (!location) {
      const error: any = new Error('Location not found.');
      error.statusCode = 404;
      throw error;
    }

    const onHand = await this.getOnHandByLocation(data.itemId, data.locationId);
    if (onHand + data.quantity < 0) {
      const error: any = new Error(
        `Adjustment would result in negative stock at location "${location.name}". Available: ${onHand}, adjustment: ${data.quantity}.`
      );
      error.statusCode = 400;
      throw error;
    }

    const movement = await prisma.stockMovement.create({
      data: {
        itemId: data.itemId,
        kind: 'ADJUSTMENT',
        quantity: data.quantity,
        locationId: data.locationId,
        reason: data.reason.trim(),
        recordedById: userId,
      },
      include: {
        item: true,
        location: true,
        recordedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    await AlertsService.reevaluateAlert(data.itemId);

    return movement;
  }

  /**
   * Get movement history for an item (paginated)
   */
  static async getItemMovements(itemId: string, page: number = 1, limit: number = 10) {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      const error: any = new Error('Item not found.');
      error.statusCode = 404;
      throw error;
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where: { itemId },
        include: {
          location: true,
          recordedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      prisma.stockMovement.count({ where: { itemId } }),
    ]);

    return {
      data: movements,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }
}

import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';

export interface ItemLocationStock {
  locationId: string;
  locationName: string;
  onHand: number;
}

export interface ItemStockSummary {
  totalOnHand: number;
  locations: ItemLocationStock[];
}

export async function calculateOnHandForItems(itemIds: string[]): Promise<Map<string, ItemStockSummary>> {
  if (itemIds.length === 0) {
    return new Map();
  }

  const movements = await prisma.stockMovement.findMany({
    where: {
      itemId: { in: itemIds },
    },
    include: {
      location: true,
    },
  });

  const perItemStock = new Map<string, Map<string, number>>();

  for (const movement of movements) {
    const locationMap = perItemStock.get(movement.itemId) ?? new Map<string, number>();

    if (movement.kind === 'RECEIPT' || movement.kind === 'ADJUSTMENT') {
      locationMap.set(movement.locationId, (locationMap.get(movement.locationId) ?? 0) + movement.quantity);
    } else if (movement.kind === 'ISSUE') {
      locationMap.set(movement.locationId, (locationMap.get(movement.locationId) ?? 0) - movement.quantity);
    } else if (movement.kind === 'TRANSFER') {
      if (movement.sourceLocationId) {
        locationMap.set(movement.sourceLocationId, (locationMap.get(movement.sourceLocationId) ?? 0) - movement.quantity);
      }
      if (movement.destinationLocationId) {
        locationMap.set(movement.destinationLocationId, (locationMap.get(movement.destinationLocationId) ?? 0) + movement.quantity);
      }
    }

    perItemStock.set(movement.itemId, locationMap);
  }

  const locationIds = Array.from(
    new Set(
      movements.flatMap((movement) => [
        movement.locationId,
        movement.sourceLocationId,
        movement.destinationLocationId,
      ]).filter((id): id is string => Boolean(id))
    )
  );

  const locations = await prisma.location.findMany({
    where: {
      id: { in: locationIds },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const locationNames = new Map(locations.map((location) => [location.id, location.name]));

  const result = new Map<string, ItemStockSummary>();

  for (const itemId of itemIds) {
    const itemLocations = perItemStock.get(itemId) ?? new Map<string, number>();

    const locationEntries: ItemLocationStock[] = Array.from(itemLocations.entries())
      .map(([locationId, onHand]) => ({
        locationId,
        locationName: locationNames.get(locationId) ?? 'Unknown location',
        onHand,
      }))
      .filter((entry) => entry.onHand !== 0)
      .sort((a, b) => a.locationName.localeCompare(b.locationName));

    const totalOnHand = locationEntries.reduce((sum, entry) => sum + entry.onHand, 0);

    result.set(itemId, {
      totalOnHand,
      locations: locationEntries,
    });
  }

  return result;
}

import type { InventoryItemView } from '@glist/views'
import { asc, eq, inArray } from 'drizzle-orm'
import type { InventoryItemQueryRepository } from '@/domain/inventory-item/inventory-item-query-repository'
import type { Database } from '../persistence'
import {
  inventoryItemPhotos,
  inventoryItemShops,
  inventoryItems,
} from '../persistence/schema'
import { getPhotoUrl } from '../storage/photo-storage'

type InventoryItemRow = typeof inventoryItems.$inferSelect

function inventoryItemRowToView(
  row: InventoryItemRow,
  shopIds: string[],
  photoKeys: string[],
  photoUrlBase: string,
): InventoryItemView {
  return {
    id: row.id,
    householdId: row.householdId,
    name: row.name,
    description: row.description,
    categoryId: row.categoryId,
    basePriceCents: row.basePriceCents,
    basePriceUnit: row.basePriceUnit,
    targetStock: row.targetStock,
    targetStockUnit: row.targetStockUnit,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
    shopIds,
    photoUrls: photoKeys.map((key) => getPhotoUrl(key, photoUrlBase)),
    photoKeys,
  }
}

export class DrizzleInventoryItemQueryRepository
  implements InventoryItemQueryRepository
{
  constructor(
    private db: Database,
    private photoUrlBase: string,
  ) {}

  async getAll(householdId: string): Promise<InventoryItemView[]> {
    const rows = await this.db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.householdId, householdId))
      .orderBy(asc(inventoryItems.createdAt))

    if (rows.length === 0) {
      return []
    }

    const itemIds = rows.map((row) => row.id)
    const shopAssociations = await this.db
      .select()
      .from(inventoryItemShops)
      .where(inArray(inventoryItemShops.inventoryItemId, itemIds))

    const shopIdsByItemId = new Map<string, string[]>()
    for (const assoc of shopAssociations) {
      const shops = shopIdsByItemId.get(assoc.inventoryItemId) ?? []
      shops.push(assoc.shopId)
      shopIdsByItemId.set(assoc.inventoryItemId, shops)
    }

    const photoAssociations = await this.db
      .select()
      .from(inventoryItemPhotos)
      .where(inArray(inventoryItemPhotos.inventoryItemId, itemIds))

    const photoKeysByItemId = new Map<string, string[]>()
    for (const assoc of photoAssociations) {
      const keys = photoKeysByItemId.get(assoc.inventoryItemId) ?? []
      keys.push(assoc.photoKey)
      photoKeysByItemId.set(assoc.inventoryItemId, keys)
    }

    return rows.map((row) => {
      const shopIds = shopIdsByItemId.get(row.id) ?? []
      const photoKeys = photoKeysByItemId.get(row.id) ?? []
      return inventoryItemRowToView(row, shopIds, photoKeys, this.photoUrlBase)
    })
  }
}

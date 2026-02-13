import { InventoryItemDtoRepository } from '@/domain/inventory-item/inventory-item-dto-repository'
import { InventoryItemDto } from '@glist/dtos'
import { asc, eq, inArray } from 'drizzle-orm'
import { Database } from '../persistence'
import { inventoryItems, inventoryItemShops } from '../persistence/schema'

type InventoryItemRow = typeof inventoryItems.$inferSelect

function inventoryItemRowToDto(
  row: InventoryItemRow,
  shopIds: string[],
): InventoryItemDto {
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
    createdAt: row.createdAt!.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
    shopIds,
    photoUrl: row.photoKey,
  }
}

export class DrizzleInventoryItemDtoRepository implements InventoryItemDtoRepository {
  constructor(private db: Database) {}

  async findAllByHouseholdId(householdId: string): Promise<InventoryItemDto[]> {
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

    return rows.map((row) => {
      const shopIds = shopIdsByItemId.get(row.id) ?? []
      return inventoryItemRowToDto(row, shopIds)
    })
  }
}

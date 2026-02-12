import { InventoryItem } from '@/domain/inventory-item/inventory-item'
import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { Database } from '@/infrastructure/persistence'
import {
  inventoryItems,
  inventoryItemShops,
} from '@/infrastructure/persistence/schema'
import { eq, inArray } from 'drizzle-orm'

export class DrizzleInventoryItemRepository implements InventoryItemRepository {
  constructor(private db: Database) {}

  async findAllByHouseholdId(householdId: string): Promise<InventoryItem[]> {
    const itemRows = await this.db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.householdId, householdId))

    if (itemRows.length === 0) {
      return []
    }

    const itemIds = itemRows.map((row) => row.id)
    const shopRows = await this.db
      .select()
      .from(inventoryItemShops)
      .where(inArray(inventoryItemShops.inventoryItemId, itemIds))

    const shopsByItemId = new Map<string, string[]>()
    for (const row of shopRows) {
      const shops = shopsByItemId.get(row.inventoryItemId) ?? []
      shops.push(row.shopId)
      shopsByItemId.set(row.inventoryItemId, shops)
    }

    return itemRows.map((row) =>
      InventoryItem.reconstitute({
        id: row.id,
        householdId: row.householdId,
        name: row.name,
        description: row.description,
        categoryId: row.categoryId,
        targetStock: row.targetStock,
        targetStockUnit: row.targetStockUnit,
        basePriceCents: row.basePriceCents,
        basePriceUnit: row.basePriceUnit,
        shopIds: shopsByItemId.get(row.id) ?? [],
        createdAt: row.createdAt!,
        updatedAt: row.updatedAt,
      }),
    )
  }
}

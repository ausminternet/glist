import {
  InventoryItem,
  InventoryItemProps,
} from '@/domain/inventory-item/inventory-item'
import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { Price } from '@/domain/shared/price'
import { Quantity } from '@/domain/shared/quantity'
import { Database } from '@/infrastructure/persistence'
import {
  inventoryItems,
  inventoryItemShops,
} from '@/infrastructure/persistence/schema'
import { eq, inArray } from 'drizzle-orm'

type InventoryItemRow = typeof inventoryItems.$inferSelect

function toDomain(row: InventoryItemRow, shopIds: string[]): InventoryItem {
  const targetStockResult = Quantity.create(
    row.targetStock,
    row.targetStockUnit,
  )
  if (!targetStockResult.ok) {
    throw new Error(
      `Corrupt database: invalid targetStock for inventory item ${row.id}: ${JSON.stringify(targetStockResult.error)}`,
    )
  }

  const basePriceResult = Price.create(row.basePriceCents, row.basePriceUnit)
  if (!basePriceResult.ok) {
    throw new Error(
      `Corrupt database: invalid basePrice for inventory item ${row.id}: ${JSON.stringify(basePriceResult.error)}`,
    )
  }

  const props: InventoryItemProps = {
    id: row.id,
    householdId: row.householdId,
    name: row.name,
    description: row.description,
    categoryId: row.categoryId,
    targetStock: targetStockResult.value,
    basePrice: basePriceResult.value,
    shopIds,
    createdAt: row.createdAt!,
    updatedAt: row.updatedAt,
  }

  return new InventoryItem(props)
}

function toSchema(item: InventoryItem): typeof inventoryItems.$inferInsert {
  return {
    id: item.id,
    householdId: item.householdId,
    name: item.name,
    description: item.description,
    categoryId: item.categoryId,
    targetStock: item.targetStock,
    targetStockUnit: item.targetStockUnit,
    basePriceCents: item.basePriceCents,
    basePriceUnit: item.basePriceUnit,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

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
    const shopAssociations = await this.db
      .select()
      .from(inventoryItemShops)
      .where(inArray(inventoryItemShops.inventoryItemId, itemIds))

    const shopsByItemId = new Map<string, string[]>()
    for (const row of shopAssociations) {
      const shops = shopsByItemId.get(row.inventoryItemId) ?? []
      shops.push(row.shopId)
      shopsByItemId.set(row.inventoryItemId, shops)
    }

    return itemRows.map((row) => {
      const shopIds = shopsByItemId.get(row.id) ?? []
      return toDomain(row, shopIds)
    })
  }
}

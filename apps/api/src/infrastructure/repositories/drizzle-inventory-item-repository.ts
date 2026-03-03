import { asc, eq, inArray } from 'drizzle-orm'
import { parseCategoryId } from '@/domain/category/category-id'
import { parseHouseholdId } from '@/domain/household/household-id'
import {
  InventoryItem,
  type InventoryItemProps,
} from '@/domain/inventory-item/inventory-item'
import { parseInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { ItemPhoto } from '@/domain/shared/item-photo'
import { Price } from '@/domain/shared/price'
import { Quantity } from '@/domain/shared/quantity'
import { parseShopIds } from '@/domain/shop/shop-id'
import type { Database } from '@/infrastructure/persistence'
import {
  inventoryItemPhotos,
  inventoryItemShops,
  inventoryItems,
} from '@/infrastructure/persistence/schema'

type InventoryItemRow = typeof inventoryItems.$inferSelect
type ItemPhotoRow = typeof inventoryItemPhotos.$inferSelect

function toDomain(
  row: InventoryItemRow,
  shopIds: string[],
  photos: ItemPhotoRow[],
): InventoryItem {
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
    id: parseInventoryItemId(row.id),
    householdId: parseHouseholdId(row.householdId),
    name: row.name,
    description: row.description,
    categoryId: row.categoryId ? parseCategoryId(row.categoryId) : null,
    targetStock: targetStockResult.value,
    basePrice: basePriceResult.value,
    shopIds: parseShopIds(shopIds),
    photos: photos.map((p) => new ItemPhoto(p.id, p.photoKey, p.createdAt)),
    createdAt: row.createdAt,
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

  async save(item: InventoryItem): Promise<void> {
    const itemSchema = toSchema(item)

    const upsertItem = this.db
      .insert(inventoryItems)
      .values(itemSchema)
      .onConflictDoUpdate({
        target: inventoryItems.id,
        set: {
          name: itemSchema.name,
          description: itemSchema.description,
          categoryId: itemSchema.categoryId,
          targetStock: itemSchema.targetStock,
          targetStockUnit: itemSchema.targetStockUnit,
          basePriceCents: itemSchema.basePriceCents,
          basePriceUnit: itemSchema.basePriceUnit,
          updatedAt: itemSchema.updatedAt,
        },
      })

    const deleteShops = this.db
      .delete(inventoryItemShops)
      .where(eq(inventoryItemShops.inventoryItemId, item.id))

    const shopAssociations = [...item.shopIds].map((shopId) => ({
      inventoryItemId: item.id,
      shopId,
    }))

    const deletePhotos = this.db
      .delete(inventoryItemPhotos)
      .where(eq(inventoryItemPhotos.inventoryItemId, item.id))

    const photoAssociations = item.photos.map((p) => ({
      id: p.id,
      inventoryItemId: item.id,
      photoKey: p.photoKey,
      createdAt: p.createdAt,
    }))

    const batch: [any, ...any[]] = [upsertItem, deleteShops, deletePhotos]
    if (shopAssociations.length > 0) {
      batch.push(this.db.insert(inventoryItemShops).values(shopAssociations))
    }
    if (photoAssociations.length > 0) {
      batch.push(this.db.insert(inventoryItemPhotos).values(photoAssociations))
    }

    await this.db.batch(batch)
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(inventoryItems).where(eq(inventoryItems.id, id))
  }

  async findById(id: string): Promise<InventoryItem | null> {
    const row = await this.db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .get()

    if (!row) {
      return null
    }

    const shopAssociations = await this.db
      .select()
      .from(inventoryItemShops)
      .where(eq(inventoryItemShops.inventoryItemId, id))

    const shopIds = shopAssociations.map((r) => r.shopId)

    const photos = await this.db
      .select()
      .from(inventoryItemPhotos)
      .where(eq(inventoryItemPhotos.inventoryItemId, id))

    return toDomain(row, shopIds, photos)
  }

  async findAllByHouseholdId(householdId: string): Promise<InventoryItem[]> {
    const itemRows = await this.db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.householdId, householdId))
      .orderBy(asc(inventoryItems.createdAt))

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

    const photoAssociations = await this.db
      .select()
      .from(inventoryItemPhotos)
      .where(inArray(inventoryItemPhotos.inventoryItemId, itemIds))

    const photosByItemId = new Map<string, ItemPhotoRow[]>()
    for (const row of photoAssociations) {
      const photos = photosByItemId.get(row.inventoryItemId) ?? []
      photos.push(row)
      photosByItemId.set(row.inventoryItemId, photos)
    }

    return itemRows.map((row) => {
      const shopIds = shopsByItemId.get(row.id) ?? []
      const photos = photosByItemId.get(row.id) ?? []
      return toDomain(row, shopIds, photos)
    })
  }
}

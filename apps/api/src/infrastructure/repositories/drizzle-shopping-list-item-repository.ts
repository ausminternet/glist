import { and, eq, inArray } from 'drizzle-orm'
import { parseCategoryId } from '@/domain/category/category-id'
import { parseHouseholdId } from '@/domain/household/household-id'
import { parseInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import { ItemPhoto } from '@/domain/shared/item-photo'
import { Quantity } from '@/domain/shared/quantity'
import { parseShopIds } from '@/domain/shop/shop-id'
import {
  ShoppingListItem,
  type ShoppingListItemProps,
} from '@/domain/shopping-list-item/shopping-list-item'
import { parseShoppingListItemId } from '@/domain/shopping-list-item/shopping-list-item-id'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { Database } from '@/infrastructure/persistence'
import {
  shoppingListItemPhotos,
  shoppingListItemShops,
  shoppingListItems,
} from '@/infrastructure/persistence/schema'

type ShoppingListItemRow = typeof shoppingListItems.$inferSelect
type ItemPhotoRow = typeof shoppingListItemPhotos.$inferSelect

function toDomain(
  row: ShoppingListItemRow,
  shopIds: string[],
  photos: ItemPhotoRow[],
): ShoppingListItem {
  const quantityResult = Quantity.create(row.quantity, row.quantityUnit)
  if (!quantityResult.ok) {
    throw new Error(
      `Corrupt database: invalid quantity for shopping list item ${row.id}: ${JSON.stringify(quantityResult.error)}`,
    )
  }

  const props: ShoppingListItemProps = {
    id: parseShoppingListItemId(row.id),
    householdId: parseHouseholdId(row.householdId),
    name: row.name,
    description: row.description,
    categoryId: row.categoryId ? parseCategoryId(row.categoryId) : null,
    quantity: quantityResult.value,
    checked: row.checked,
    shopIds: parseShopIds(shopIds),
    photos: photos.map((p) => new ItemPhoto(p.id, p.photoKey, p.createdAt)),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    inventoryItemId: row.inventoryItemId
      ? parseInventoryItemId(row.inventoryItemId)
      : null,
  }

  return new ShoppingListItem(props)
}

function toSchema(
  item: ShoppingListItem,
): typeof shoppingListItems.$inferInsert {
  return {
    id: item.id,
    householdId: item.householdId,
    name: item.name,
    description: item.description,
    categoryId: item.categoryId,
    quantity: item.quantity,
    quantityUnit: item.quantityUnit,
    checked: item.checked,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    inventoryItemId: item.inventoryItemId,
  }
}

export class DrizzleShoppingListItemRepository
  implements ShoppingListItemRepository
{
  constructor(private db: Database) {}

  async save(item: ShoppingListItem): Promise<void> {
    const schema = toSchema(item)

    const upsertItem = this.db
      .insert(shoppingListItems)
      .values(schema)
      .onConflictDoUpdate({
        target: shoppingListItems.id,
        set: {
          name: schema.name,
          description: schema.description,
          categoryId: schema.categoryId,
          quantity: schema.quantity,
          quantityUnit: schema.quantityUnit,
          checked: schema.checked,
          updatedAt: schema.updatedAt,
          inventoryItemId: schema.inventoryItemId,
        },
      })

    const deleteShops = this.db
      .delete(shoppingListItemShops)
      .where(eq(shoppingListItemShops.shoppingListItemId, item.id))

    const shopAssociations = [...item.shopIds].map((shopId) => ({
      shoppingListItemId: item.id,
      shopId,
    }))

    const deletePhotos = this.db
      .delete(shoppingListItemPhotos)
      .where(eq(shoppingListItemPhotos.shoppingListItemId, item.id))

    const photoAssociations = item.photos.map((p) => ({
      id: p.id,
      shoppingListItemId: item.id,
      photoKey: p.photoKey,
      createdAt: p.createdAt,
    }))

    const batch: [any, ...any[]] = [upsertItem, deleteShops, deletePhotos]
    if (shopAssociations.length > 0) {
      batch.push(this.db.insert(shoppingListItemShops).values(shopAssociations))
    }
    if (photoAssociations.length > 0) {
      batch.push(
        this.db.insert(shoppingListItemPhotos).values(photoAssociations),
      )
    }

    await this.db.batch(batch)
  }

  async findById(id: string): Promise<ShoppingListItem | null> {
    const row = await this.db
      .select()
      .from(shoppingListItems)
      .where(eq(shoppingListItems.id, id))
      .get()

    if (!row) {
      return null
    }

    const shopAssociations = await this.db
      .select()
      .from(shoppingListItemShops)
      .where(eq(shoppingListItemShops.shoppingListItemId, id))

    const shopIds = shopAssociations.map((r) => r.shopId)

    const photoAssociations = await this.db
      .select()
      .from(shoppingListItemPhotos)
      .where(eq(shoppingListItemPhotos.shoppingListItemId, id))

    return toDomain(row, shopIds, photoAssociations)
  }

  async delete(id: string): Promise<void> {
    // Shop associations are deleted via CASCADE
    await this.db.delete(shoppingListItems).where(eq(shoppingListItems.id, id))
  }

  async findCheckedByHouseholdId(
    householdId: string,
  ): Promise<ShoppingListItem[]> {
    const rows = await this.db
      .select()
      .from(shoppingListItems)
      .where(
        and(
          eq(shoppingListItems.householdId, householdId),
          eq(shoppingListItems.checked, true),
        ),
      )

    if (rows.length === 0) {
      return []
    }

    const itemIds = rows.map((r) => r.id)

    const photoAssociations = await this.db
      .select()
      .from(shoppingListItemPhotos)
      .where(inArray(shoppingListItemPhotos.shoppingListItemId, itemIds))

    const photosByItemId = new Map<string, ItemPhotoRow[]>()
    for (const row of photoAssociations) {
      const photos = photosByItemId.get(row.shoppingListItemId) ?? []
      photos.push(row)
      photosByItemId.set(row.shoppingListItemId, photos)
    }

    return rows.map((row) => {
      const photos = photosByItemId.get(row.id) ?? []
      return toDomain(row, [], photos)
    })
  }

  async deleteCheckedByHouseholdId(householdId: string): Promise<void> {
    // Shop associations are deleted via CASCADE
    await this.db
      .delete(shoppingListItems)
      .where(
        and(
          eq(shoppingListItems.householdId, householdId),
          eq(shoppingListItems.checked, true),
        ),
      )
  }
}

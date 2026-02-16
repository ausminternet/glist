import { and, eq } from 'drizzle-orm'
import { parseCategoryId } from '@/domain/category/category-id'
import { parseInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import { parseHouseholdId } from '@/domain/shared/household-id'
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
  shoppingListItemShops,
  shoppingListItems,
} from '@/infrastructure/persistence/schema'

type ShoppingListItemRow = typeof shoppingListItems.$inferSelect

function toDomain(
  row: ShoppingListItemRow,
  shopIds: string[],
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
    photoKey: row.photoKey,
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
    photoKey: item.photoKey,
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

    // Upsert the item
    await this.db
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
          photoKey: schema.photoKey,
          updatedAt: schema.updatedAt,
          inventoryItemId: schema.inventoryItemId,
        },
      })

    // Update shop associations: delete existing and insert new
    await this.db
      .delete(shoppingListItemShops)
      .where(eq(shoppingListItemShops.shoppingListItemId, item.id))

    if (item.shopIds.length > 0) {
      await this.db.insert(shoppingListItemShops).values(
        [...item.shopIds].map((shopId) => ({
          shoppingListItemId: item.id,
          shopId,
        })),
      )
    }
  }

  async find(id: string): Promise<ShoppingListItem | null> {
    const row = await this.db
      .select()
      .from(shoppingListItems)
      .where(eq(shoppingListItems.id, id))
      .get()

    if (!row) {
      return null
    }

    const shopRows = await this.db
      .select()
      .from(shoppingListItemShops)
      .where(eq(shoppingListItemShops.shoppingListItemId, id))

    const shopIds = shopRows.map((r) => r.shopId)

    return toDomain(row, shopIds)
  }

  async delete(id: string): Promise<void> {
    // Shop associations are deleted via CASCADE
    await this.db.delete(shoppingListItems).where(eq(shoppingListItems.id, id))
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

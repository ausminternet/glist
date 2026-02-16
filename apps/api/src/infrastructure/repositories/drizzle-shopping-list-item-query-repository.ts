import type { ShoppingListItemView } from '@glist/views'
import { eq, inArray } from 'drizzle-orm'
import type { ShoppingListItemQueryRepository } from '@/domain/shopping-list-item/shopping-list-item-query-repository'
import type { Database } from '../persistence'
import { shoppingListItemShops, shoppingListItems } from '../persistence/schema'

type ShoppingListItemRow = typeof shoppingListItems.$inferSelect

function shoppingListItemToView(
  itemRow: ShoppingListItemRow,
  shopIds: string[],
): ShoppingListItemView {
  return {
    id: itemRow.id,
    householdId: itemRow.householdId,
    name: itemRow.name,
    description: itemRow.description,
    categoryId: itemRow.categoryId,
    quantity: itemRow.quantity,
    quantityUnit: itemRow.quantityUnit,
    checked: itemRow.checked,
    createdAt: itemRow.createdAt.toISOString(),
    updatedAt: itemRow.updatedAt?.toISOString() ?? null,
    inventoryItemId: itemRow.inventoryItemId,
    shopIds,
    photoUrl: itemRow.photoKey,
  }
}

export class DrizzleShoppingListItemQueryRepository
  implements ShoppingListItemQueryRepository
{
  constructor(private db: Database) {}

  async find(id: string): Promise<ShoppingListItemView | null> {
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

    return shoppingListItemToView(row, shopIds)
  }

  async getAll(householdId: string): Promise<ShoppingListItemView[]> {
    const rows = await this.db
      .select()
      .from(shoppingListItems)
      .where(eq(shoppingListItems.householdId, householdId))

    if (rows.length === 0) {
      return []
    }

    const itemIds = rows.map((row) => row.id)
    const shopRows = await this.db
      .select()
      .from(shoppingListItemShops)
      .where(inArray(shoppingListItemShops.shoppingListItemId, itemIds))

    const shopsByItemId = new Map<string, string[]>()
    for (const row of shopRows) {
      const shops = shopsByItemId.get(row.shoppingListItemId) ?? []
      shops.push(row.shopId)
      shopsByItemId.set(row.shoppingListItemId, shops)
    }

    return rows.map((row) =>
      shoppingListItemToView(row, shopsByItemId.get(row.id) ?? []),
    )
  }
}

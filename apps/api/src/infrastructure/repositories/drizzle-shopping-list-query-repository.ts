import type { ShoppingListItemView, ShoppingListView } from '@glist/views'
import { asc, eq, inArray } from 'drizzle-orm'
import type { ShoppingListQueryRepository } from '@/domain/shopping-list/shopping-list-query-repository'
import type { Database } from '../persistence'
import {
  shoppingListItemShops,
  shoppingListItems,
  shoppingLists,
} from '../persistence/schema'

type ShoppingListRow = typeof shoppingLists.$inferSelect
type ShoppingListItemRow = typeof shoppingListItems.$inferSelect

function shoppingListItemToView(
  itemRow: ShoppingListItemRow,
  shopIds: string[],
): ShoppingListItemView {
  return {
    id: itemRow.id,
    shoppingListId: itemRow.shoppingListId,
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

function shoppingListToView(
  listRow: ShoppingListRow,
  items: ShoppingListItemView[],
): ShoppingListView {
  return {
    id: listRow.id,
    householdId: listRow.householdId,
    name: listRow.name,
    items,
    createdAt: listRow.createdAt.toISOString(),
    updatedAt: listRow.updatedAt?.toISOString() ?? null,
  }
}

export class DrizzleShoppingListQueryRepository
  implements ShoppingListQueryRepository
{
  constructor(private db: Database) {}

  async findById(id: string): Promise<ShoppingListView | null> {
    const listRow = await this.db
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.id, id))
      .get()

    if (!listRow) {
      return null
    }

    const itemRows = await this.db
      .select()
      .from(shoppingListItems)
      .where(eq(shoppingListItems.shoppingListId, id))
      .orderBy(asc(shoppingListItems.createdAt))

    const itemIds = itemRows.map((row) => row.id)
    const shopRows =
      itemIds.length > 0
        ? await this.db
            .select()
            .from(shoppingListItemShops)
            .where(inArray(shoppingListItemShops.shoppingListItemId, itemIds))
        : []

    const shopsByItemId = new Map<string, string[]>()
    for (const row of shopRows) {
      const shops = shopsByItemId.get(row.shoppingListItemId) ?? []
      shops.push(row.shopId)
      shopsByItemId.set(row.shoppingListItemId, shops)
    }

    const items = itemRows.map((row) =>
      shoppingListItemToView(row, shopsByItemId.get(row.id) ?? []),
    )

    return shoppingListToView(listRow, items)
  }

  async findByHouseholdId(householdId: string): Promise<ShoppingListView[]> {
    const listRows = await this.db
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.householdId, householdId))

    const listIds = listRows.map((row) => row.id)
    const itemRows =
      listIds.length > 0
        ? await this.db
            .select()
            .from(shoppingListItems)
            .where(inArray(shoppingListItems.shoppingListId, listIds))
        : []

    const itemIds = itemRows.map((row) => row.id)
    const shopRows =
      itemIds.length > 0
        ? await this.db
            .select()
            .from(shoppingListItemShops)
            .where(inArray(shoppingListItemShops.shoppingListItemId, itemIds))
        : []

    const shopsByItemId = new Map<string, string[]>()
    for (const row of shopRows) {
      const shops = shopsByItemId.get(row.shoppingListItemId) ?? []
      shops.push(row.shopId)
      shopsByItemId.set(row.shoppingListItemId, shops)
    }

    const items = itemRows.map((row) =>
      shoppingListItemToView(row, shopsByItemId.get(row.id) ?? []),
    )

    return listRows.map((row) => shoppingListToView(row, items))
  }
}

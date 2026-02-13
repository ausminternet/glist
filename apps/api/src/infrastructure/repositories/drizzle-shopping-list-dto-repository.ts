import { ShoppingListDtoRepository } from '@/domain/shopping-list/shopping-list-dto-repository'
import { ShoppingListDto, ShoppingListItemDto } from '@glist/dtos'
import { asc, eq, inArray } from 'drizzle-orm'
import { Database } from '../persistence'
import {
  shoppingListItems,
  shoppingListItemShops,
  shoppingLists,
} from '../persistence/schema'

type ShoppingListRow = typeof shoppingLists.$inferSelect
type ShoppingListItemRow = typeof shoppingListItems.$inferSelect

function shoppingListItemToDto(
  itemRow: ShoppingListItemRow,
  shopIds: string[],
): ShoppingListItemDto {
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

function shoppingListToDto(
  listRow: ShoppingListRow,
  items: ShoppingListItemDto[],
): ShoppingListDto {
  return {
    id: listRow.id,
    householdId: listRow.householdId,
    name: listRow.name,
    items,
    createdAt: listRow.createdAt.toISOString(),
    updatedAt: listRow.updatedAt?.toISOString() ?? null,
  }
}

export class DrizzleShoppingListDtoRepository implements ShoppingListDtoRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<ShoppingListDto | null> {
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
      shoppingListItemToDto(row, shopsByItemId.get(row.id) ?? []),
    )

    return shoppingListToDto(listRow, items)
  }
}

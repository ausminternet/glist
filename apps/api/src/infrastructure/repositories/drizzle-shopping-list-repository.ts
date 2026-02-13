import { Quantity } from '@/domain/shared/quantity'
import {
  ShoppingList,
  ShoppingListProps,
} from '@/domain/shopping-list/shopping-list'
import {
  ShoppingListItem,
  ShoppingListItemProps,
} from '@/domain/shopping-list/shopping-list-item'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { Database } from '@/infrastructure/persistence'
import {
  shoppingListItems,
  shoppingListItemShops,
  shoppingLists,
} from '@/infrastructure/persistence/schema'
import { asc, eq, inArray } from 'drizzle-orm'

type ShoppingListRow = typeof shoppingLists.$inferSelect
type ShoppingListItemRow = typeof shoppingListItems.$inferSelect

function shoppingListItemToDomain(
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
    id: row.id,
    shoppingListId: row.shoppingListId,
    name: row.name,
    description: row.description,
    categoryId: row.categoryId,
    quantity: quantityResult.value,
    checked: row.checked,
    shopIds,
    createdAt: row.createdAt!,
    updatedAt: row.updatedAt,
    inventoryItemId: row.inventoryItemId,
  }

  return new ShoppingListItem(props)
}

function shoppingListItemToSchema(
  item: ShoppingListItem,
): typeof shoppingListItems.$inferInsert {
  return {
    id: item.id,
    shoppingListId: item.shoppingListId,
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

function shoppingListToDomain(
  row: ShoppingListRow,
  items: ShoppingListItem[],
): ShoppingList {
  const props: ShoppingListProps = {
    id: row.id,
    householdId: row.householdId,
    name: row.name,
    items,
    createdAt: row.createdAt!,
    updatedAt: row.updatedAt,
  }

  return new ShoppingList(props)
}

function shoppingListToSchema(
  list: ShoppingList,
): typeof shoppingLists.$inferInsert {
  return {
    id: list.id,
    householdId: list.householdId,
    name: list.name,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }
}

export class DrizzleShoppingListRepository implements ShoppingListRepository {
  constructor(private db: Database) {}

  async save(shoppingList: ShoppingList): Promise<void> {
    const listSchema = shoppingListToSchema(shoppingList)

    const upsertList = this.db
      .insert(shoppingLists)
      .values(listSchema)
      .onConflictDoUpdate({
        target: shoppingLists.id,
        set: {
          name: listSchema.name,
          updatedAt: listSchema.updatedAt,
        },
      })

    const deleteItems = this.db
      .delete(shoppingListItems)
      .where(eq(shoppingListItems.shoppingListId, shoppingList.id))

    if (shoppingList.items.length === 0) {
      await this.db.batch([upsertList, deleteItems])
      return
    }

    const insertItems = this.db
      .insert(shoppingListItems)
      .values(shoppingList.items.map((item) => shoppingListItemToSchema(item)))

    const shopAssociations = shoppingList.items.flatMap((item) =>
      [...item.shopIds].map((shopId) => ({
        shoppingListItemId: item.id,
        shopId,
      })),
    )

    if (shopAssociations.length > 0) {
      const insertShops = this.db
        .insert(shoppingListItemShops)
        .values(shopAssociations)

      await this.db.batch([upsertList, deleteItems, insertItems, insertShops])
    } else {
      await this.db.batch([upsertList, deleteItems, insertItems])
    }
  }

  async findById(id: string): Promise<ShoppingList | null> {
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
      shoppingListItemToDomain(row, shopsByItemId.get(row.id) ?? []),
    )

    return shoppingListToDomain(listRow, items)
  }
}

import { ShoppingList } from '@/domain/shopping-list/shopping-list'
import { ShoppingListItem } from '@/domain/shopping-list/shopping-list-item'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { Database } from '@/infrastructure/persistence'
import {
  shoppingListItems,
  shoppingListItemShops,
  shoppingLists,
} from '@/infrastructure/persistence/schema'
import { eq, inArray } from 'drizzle-orm'

export class DrizzleShoppingListRepository implements ShoppingListRepository {
  constructor(private db: Database) {}

  async save(shoppingList: ShoppingList): Promise<void> {
    const snapshot = shoppingList.toSnapshot()

    const upsertList = this.db
      .insert(shoppingLists)
      .values({
        id: snapshot.id,
        householdId: snapshot.householdId,
        name: snapshot.name,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt,
      })
      .onConflictDoUpdate({
        target: shoppingLists.id,
        set: {
          name: snapshot.name,
          updatedAt: snapshot.updatedAt,
        },
      })

    const deleteItems = this.db
      .delete(shoppingListItems)
      .where(eq(shoppingListItems.shoppingListId, snapshot.id))

    if (snapshot.items.length === 0) {
      await this.db.batch([upsertList, deleteItems])
      return
    }

    const insertItems = this.db.insert(shoppingListItems).values(
      snapshot.items.map((item) => ({
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
      })),
    )

    const shopAssociations = snapshot.items.flatMap((item) =>
      item.shopIds.map((shopId) => ({
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
      ShoppingListItem.reconstitute({
        id: row.id,
        shoppingListId: row.shoppingListId,
        name: row.name,
        description: row.description,
        categoryId: row.categoryId,
        quantity: row.quantity,
        quantityUnit: row.quantityUnit,
        checked: row.checked,
        shopIds: shopsByItemId.get(row.id) ?? [],
        createdAt: row.createdAt!,
        updatedAt: row.updatedAt,
        inventoryItemId: row.inventoryItemId,
      }),
    )

    return ShoppingList.reconstitute({
      id: listRow.id,
      householdId: listRow.householdId,
      name: listRow.name,
      items,
      createdAt: listRow.createdAt!,
      updatedAt: listRow.updatedAt,
    })
  }
}

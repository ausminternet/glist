import { Database } from '@/db'
import {
  shoppingListItems,
  shoppingListItemShops,
  shoppingLists,
} from '@/db/schema'
import { ShoppingList } from '@/domain/shopping-list/shopping-list'
import { ShoppingListItem } from '@/domain/shopping-list/shopping-list-item'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { eq, inArray } from 'drizzle-orm'

export class DrizzleShoppingListRepository implements ShoppingListRepository {
  constructor(private db: Database) {}

  async save(shoppingList: ShoppingList): Promise<void> {
    const snapshot = shoppingList.toSnapshot()

    await this.db.transaction(async (tx) => {
      // Upsert the shopping list
      await tx
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

      await tx
        .delete(shoppingListItems)
        .where(eq(shoppingListItems.shoppingListId, snapshot.id))

      if (snapshot.items.length > 0) {
        await tx.insert(shoppingListItems).values(
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
          })),
        )

        // Insert shop associations
        const shopAssociations = snapshot.items.flatMap((item) =>
          item.shopIds.map((shopId) => ({
            shoppingListItemId: item.id,
            shopId,
          })),
        )

        if (shopAssociations.length > 0) {
          await tx.insert(shoppingListItemShops).values(shopAssociations)
        }
      }
    })
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

    // Group shops by item id
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

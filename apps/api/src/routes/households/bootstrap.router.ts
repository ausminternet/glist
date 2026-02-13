import { eq, inArray } from 'drizzle-orm'
import { Hono } from 'hono'

import { createDb } from '@/infrastructure/persistence'
import {
  categories,
  households,
  inventoryItems,
  inventoryItemShops,
  shoppingListItems,
  shoppingListItemShops,
  shoppingLists,
  shops,
} from '@/infrastructure/persistence/schema'
import { HouseholdContext } from './context'

const bootstrapRouter = new Hono<HouseholdContext>()

bootstrapRouter.get('/', async (c) => {
  try {
    const householdId = c.get('householdId')
    const db = createDb(c.env.glist_db!)

    const [household] = await db
      .select()
      .from(households)
      .where(eq(households.id, householdId))

    if (!household) {
      return c.json(
        {
          success: false,
          error: 'Household not found',
        },
        404,
      )
    }

    const [
      householdCategories,
      householdShops,
      existingShoppingLists,
      householdInventoryItems,
    ] = await Promise.all([
      db
        .select()
        .from(categories)
        .where(eq(categories.householdId, householdId))
        .orderBy(categories.sortOrder),
      db
        .select()
        .from(shops)
        .where(eq(shops.householdId, householdId))
        .orderBy(shops.sortOrder),
      db
        .select()
        .from(shoppingLists)
        .where(eq(shoppingLists.householdId, householdId)),
      db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.householdId, householdId)),
    ])

    // Ensure at least one shopping list exists - create default if none
    let householdShoppingLists = existingShoppingLists
    if (householdShoppingLists.length === 0) {
      const [defaultList] = await db
        .insert(shoppingLists)
        .values({
          name: 'Einkaufsliste',
          householdId,
        })
        .returning()
      householdShoppingLists = [defaultList]
    }

    const shoppingListIds = householdShoppingLists.map((list) => list.id)
    const inventoryItemIds = householdInventoryItems.map((item) => item.id)

    const allShoppingListItems = await db
      .select()
      .from(shoppingListItems)
      .where(inArray(shoppingListItems.shoppingListId, shoppingListIds))

    const shoppingListItemIds = allShoppingListItems.map((item) => item.id)

    const [shoppingListItemShopRelations, inventoryItemShopRelations] =
      await Promise.all([
        shoppingListItemIds.length > 0
          ? db
              .select()
              .from(shoppingListItemShops)
              .where(
                inArray(
                  shoppingListItemShops.shoppingListItemId,
                  shoppingListItemIds,
                ),
              )
          : [],
        inventoryItemIds.length > 0
          ? db
              .select()
              .from(inventoryItemShops)
              .where(
                inArray(inventoryItemShops.inventoryItemId, inventoryItemIds),
              )
          : [],
      ])

    const shoppingListsWithItems = householdShoppingLists.map((list) => {
      const listItems = allShoppingListItems
        .filter((item) => item.shoppingListId === list.id)
        .map((item) => {
          const shopIds = shoppingListItemShopRelations
            .filter((rel) => rel.shoppingListItemId === item.id)
            .map((rel) => rel.shopId)

          return {
            ...item,
            shopIds,
          }
        })

      return {
        ...list,
        items: listItems,
      }
    })

    const inventoryItemsWithShopIds = householdInventoryItems.map((item) => {
      const shopIds = inventoryItemShopRelations
        .filter((rel) => rel.inventoryItemId === item.id)
        .map((rel) => rel.shopId)

      return {
        ...item,
        shopIds,
      }
    })

    return c.json({
      success: true,
      data: {
        household,
        categories: householdCategories,
        shops: householdShops,
        shoppingLists: shoppingListsWithItems,
        inventoryItems: inventoryItemsWithShopIds,
      },
    })
  } catch (error) {
    console.error('Bootstrap error:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    )
  }
})

export default bootstrapRouter

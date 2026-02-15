import { Hono } from 'hono'
import { BootstrapQueryHandler } from '@/application/commands/bootstrap'
import { EnsureDefaultShoppingListCommandHandler } from '@/application/commands/ensure-default-shopping-list'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleCategoryQueryRepository } from '@/infrastructure/repositories/drizzle-category-query-repository'
import { DrizzleInventoryItemQueryRepository } from '@/infrastructure/repositories/drizzle-inventory-item-query-repository'
import { DrizzleShopQueryRepository } from '@/infrastructure/repositories/drizzle-shop-query-repository'
import { DrizzleShoppingListItemQueryRepository } from '@/infrastructure/repositories/drizzle-shopping-list-item-query-repository'
import { DrizzleShoppingListQueryRepository } from '@/infrastructure/repositories/drizzle-shopping-list-query-repository'
import { DrizzleShoppingListRepository } from '@/infrastructure/repositories/drizzle-shopping-list-repository'
import type { HouseholdContext } from './context'

const bootstrapRouter = new Hono<HouseholdContext>()

bootstrapRouter.get('/', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)

  // Ensure at least one shopping list exists
  const shoppingListRepository = new DrizzleShoppingListRepository(db)
  const ensureDefaultListHandler = new EnsureDefaultShoppingListCommandHandler(
    shoppingListRepository,
  )
  const defaultList = await ensureDefaultListHandler.execute({ householdId })

  // Fetch all bootstrap data
  const bootstrapHandler = new BootstrapQueryHandler(
    new DrizzleShopQueryRepository(db),
    new DrizzleCategoryQueryRepository(db),
    new DrizzleInventoryItemQueryRepository(db),
    new DrizzleShoppingListQueryRepository(db),
    new DrizzleShoppingListItemQueryRepository(db),
  )

  const result = await bootstrapHandler.execute({ householdId })

  // If we just created a default list, add it to the result
  if (defaultList) {
    result.shoppingLists.push(defaultList)
  }

  return c.json({ success: true, data: result })
})

export default bootstrapRouter

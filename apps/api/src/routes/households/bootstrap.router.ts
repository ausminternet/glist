import { Hono } from 'hono'
import { BootstrapQueryHandler } from '@/application/queries/bootstrap'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleCategoryQueryRepository } from '@/infrastructure/repositories/drizzle-category-query-repository'
import { DrizzleInventoryItemQueryRepository } from '@/infrastructure/repositories/drizzle-inventory-item-query-repository'
import { DrizzleShopQueryRepository } from '@/infrastructure/repositories/drizzle-shop-query-repository'
import { DrizzleShoppingListItemQueryRepository } from '@/infrastructure/repositories/drizzle-shopping-list-item-query-repository'
import type { HouseholdContext } from './context'

const bootstrapRouter = new Hono<HouseholdContext>()

bootstrapRouter.get('/', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)

  const bootstrapHandler = new BootstrapQueryHandler(
    new DrizzleShopQueryRepository(db),
    new DrizzleCategoryQueryRepository(db),
    new DrizzleInventoryItemQueryRepository(db, c.env.PHOTO_URL_BASE),
    new DrizzleShoppingListItemQueryRepository(db, c.env.PHOTO_URL_BASE),
  )

  const result = await bootstrapHandler.execute({ householdId })

  return c.json({ success: true, data: result })
})

export default bootstrapRouter

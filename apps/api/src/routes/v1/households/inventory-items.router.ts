import { GetInventoryItemsQuery } from '@/application/queries/get-inventory-items'
import { createDb } from '@/db'
import { DrizzleInventoryItemRepository } from '@/infrastructure/repositories/drizzle-inventory-item-repository'
import { Hono } from 'hono'
import { HouseholdContext } from './context'

const inventoryItemsRouter = new Hono<HouseholdContext>()

inventoryItemsRouter.get('/', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleInventoryItemRepository(db)
  const query = new GetInventoryItemsQuery(repository)

  const data = await query.execute(householdId)
  return c.json({ success: true, data })
})

export default inventoryItemsRouter

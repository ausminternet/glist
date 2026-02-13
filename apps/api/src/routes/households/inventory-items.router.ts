import { GetInventoryItemsQueryHandler } from '@/application/queries/get-inventory-items'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleInventoryItemDtoRepository } from '@/infrastructure/repositories/drizzle-inventory-item-dto-repository'
import { Hono } from 'hono'
import { HouseholdContext } from './context'

const inventoryItemsRouter = new Hono<HouseholdContext>()

inventoryItemsRouter.get('/', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleInventoryItemDtoRepository(db)
  const query = new GetInventoryItemsQueryHandler(repository)

  const items = await query.execute({ householdId })

  return c.json({ success: true, data: items })
})

export default inventoryItemsRouter

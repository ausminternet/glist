import {
  GetShoppingListQuery,
  ShoppingListNotFoundError,
} from '@/application/queries/get-shopping-list'
import { createDb } from '@/db'
import { DrizzleShoppingListRepository } from '@/infrastructure/repositories/drizzle-shopping-list-repository'
import { Hono } from 'hono'
import { HouseholdContext } from './context'

const shoppingListsRouter = new Hono<HouseholdContext>()

shoppingListsRouter.get('/:id', async (c) => {
  const householdId = c.get('householdId')
  const id = c.req.param('id')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const query = new GetShoppingListQuery(repository)

  try {
    const data = await query.execute(id, householdId)
    return c.json({ success: true, data })
  } catch (error) {
    if (error instanceof ShoppingListNotFoundError) {
      return c.json({ success: false, error: 'Shopping list not found' }, 404)
    }
    throw error
  }
})

export default shoppingListsRouter

import { CheckShoppingListItemCommand } from '@/application/commands/check-shopping-list-item'
import {
  ShoppingListItemNotFoundError,
  ShoppingListNotFoundError,
} from '@/application/commands/errors'
import { UncheckShoppingListItemCommand } from '@/application/commands/uncheck-shopping-list-item'
import {
  GetShoppingListQuery,
  ShoppingListNotFoundError as QueryShoppingListNotFoundError,
} from '@/application/queries/get-shopping-list'
import { createDb } from '@/infrastructure/persistence'
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
    if (error instanceof QueryShoppingListNotFoundError) {
      return c.json({ success: false, error: 'Shopping list not found' }, 404)
    }
    throw error
  }
})

shoppingListsRouter.post('/:listId/items/:itemId/check', async (c) => {
  const householdId = c.get('householdId')
  const listId = c.req.param('listId')
  const itemId = c.req.param('itemId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const command = new CheckShoppingListItemCommand(repository)

  try {
    await command.execute(listId, itemId, householdId)
    return c.json({ success: true })
  } catch (error) {
    if (error instanceof ShoppingListNotFoundError) {
      return c.json({ success: false, error: 'Shopping list not found' }, 404)
    }
    if (error instanceof ShoppingListItemNotFoundError) {
      return c.json(
        { success: false, error: 'Shopping list item not found' },
        404,
      )
    }
    throw error
  }
})

shoppingListsRouter.post('/:listId/items/:itemId/uncheck', async (c) => {
  const householdId = c.get('householdId')
  const listId = c.req.param('listId')
  const itemId = c.req.param('itemId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const command = new UncheckShoppingListItemCommand(repository)

  try {
    await command.execute(listId, itemId, householdId)
    return c.json({ success: true })
  } catch (error) {
    if (error instanceof ShoppingListNotFoundError) {
      return c.json({ success: false, error: 'Shopping list not found' }, 404)
    }
    if (error instanceof ShoppingListItemNotFoundError) {
      return c.json(
        { success: false, error: 'Shopping list item not found' },
        404,
      )
    }
    throw error
  }
})

export default shoppingListsRouter

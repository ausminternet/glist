import { CheckShoppingListItemCommand } from '@/application/commands/check-shopping-list-item'
import { UncheckShoppingListItemCommand } from '@/application/commands/uncheck-shopping-list-item'
import { GetShoppingListQuery } from '@/application/queries/get-shopping-list'

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

  const result = await query.execute(id, householdId)
  if (!result.ok) {
    if (result.error.type === 'SHOPPING_LIST_NOT_FOUND') {
      return c.json({ success: false, error: 'Shopping list not found' }, 404)
    }

    return c.json({ success: false, error: 'An error occurred' }, 500)
  }

  return c.json({ success: true, data: result.value })
})

shoppingListsRouter.post('/:listId/items/:itemId/check', async (c) => {
  const householdId = c.get('householdId')
  const listId = c.req.param('listId')
  const itemId = c.req.param('itemId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const command = new CheckShoppingListItemCommand(repository)

  const result = await command.execute(listId, itemId, householdId)
  if (!result.ok) {
    if (result.error.type === 'SHOPPING_LIST_NOT_FOUND') {
      return c.json({ success: false, error: 'Shopping list not found' }, 404)
    }

    if (result.error.type === 'SHOPPING_LIST_ITEM_NOT_FOUND') {
      return c.json(
        { success: false, error: 'Shopping list item not found' },
        404,
      )
    }

    return c.json({ success: false, error: 'An error occurred' }, 500)
  }

  return c.json({ success: true })
})

shoppingListsRouter.post('/:listId/items/:itemId/uncheck', async (c) => {
  const householdId = c.get('householdId')
  const listId = c.req.param('listId')
  const itemId = c.req.param('itemId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const command = new UncheckShoppingListItemCommand(repository)

  const result = await command.execute(listId, itemId, householdId)
  if (!result.ok) {
    if (result.error.type === 'SHOPPING_LIST_NOT_FOUND') {
      return c.json({ success: false, error: 'Shopping list not found' }, 404)
    }

    if (result.error.type === 'SHOPPING_LIST_ITEM_NOT_FOUND') {
      return c.json(
        { success: false, error: 'Shopping list item not found' },
        404,
      )
    }

    return c.json({ success: false, error: 'An error occurred' }, 500)
  }

  return c.json({ success: true })
})

export default shoppingListsRouter

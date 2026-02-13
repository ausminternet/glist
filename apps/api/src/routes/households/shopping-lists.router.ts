import { CheckShoppingListItemCommandHandler } from '@/application/commands/check-shopping-list-item'
import {
  CreateShoppingListCommandHandler,
  CreateShoppingListCommandSchema,
} from '@/application/commands/create-shopping-list'
import { UncheckShoppingListItemCommandHandler } from '@/application/commands/uncheck-shopping-list-item'
import { GetShoppingListQueryHandler } from '@/application/queries/get-shopping-list'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleShoppingListRepository } from '@/infrastructure/repositories/drizzle-shopping-list-repository'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HouseholdContext } from './context'

const shoppingListsRouter = new Hono<HouseholdContext>()

shoppingListsRouter.get('/:id', async (c) => {
  const householdId = c.get('householdId')
  const id = c.req.param('id')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const query = new GetShoppingListQueryHandler(repository)

  const result = await query.execute({ id }, { householdId })
  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_NOT_FOUND':
        console.error('ShoppingList not found', {
          id: result.error.id,
          householdId,
        })

        return c.json({ success: false, error: 'Shopping list not found' }, 404)
    }
  }

  return c.json({ success: true, data: result.value })
})

shoppingListsRouter.post(
  '/',
  zValidator('json', CreateShoppingListCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const { name } = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleShoppingListRepository(db)
    const command = new CreateShoppingListCommandHandler(repository)

    const result = await command.execute({ name }, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'INVALID_NAME':
          console.error('Invalid shopping list name', {
            name,
            householdId,
            reason: result.error.reason,
          })

          return c.json({ success: false, error: result.error.reason }, 400)
      }
    }

    return c.json({ success: true, data: { id: result.value } }, 201)
  },
)

shoppingListsRouter.post('/:listId/items/:itemId/check', async (c) => {
  const householdId = c.get('householdId')
  const listId = c.req.param('listId')
  const itemId = c.req.param('itemId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const command = new CheckShoppingListItemCommandHandler(repository)

  const result = await command.execute(
    { shoppingListId: listId, itemId },
    { householdId },
  )
  if (!result.ok) {
    if (result.error.type === 'SHOPPING_LIST_NOT_FOUND') {
      console.error('Shopping list not found', {
        shoppingListId: listId,
        householdId,
      })

      return c.json({ success: false, error: 'Shopping list not found' }, 404)
    }

    if (result.error.type === 'SHOPPING_LIST_ITEM_NOT_FOUND') {
      console.error('Shopping list item not found', {
        shoppingListId: listId,
        itemId,
        householdId,
      })

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
  const command = new UncheckShoppingListItemCommandHandler(repository)

  const result = await command.execute(
    { shoppingListId: listId, itemId },
    { householdId },
  )
  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_NOT_FOUND':
        console.error('Shopping list not found', {
          shoppingListId: listId,
          householdId,
        })

        return c.json({ success: false, error: 'Shopping list not found' }, 404)

      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Shopping list item not found', {
          shoppingListId: listId,
          itemId,
          householdId,
        })

        return c.json(
          { success: false, error: 'Shopping list item not found' },
          404,
        )
    }
  }

  return c.json({ success: true })
})

export default shoppingListsRouter

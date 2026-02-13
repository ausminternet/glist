import { CheckShoppingListItemCommandHandler } from '@/application/commands/check-shopping-list-item'
import {
  CreateShoppingListCommandHandler,
  CreateShoppingListCommandSchema,
} from '@/application/commands/create-shopping-list'
import { UncheckShoppingListItemCommandHandler } from '@/application/commands/uncheck-shopping-list-item'
import { GetShoppingListQueryHandler } from '@/application/queries/get-shopping-list'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleShoppingListDtoRepository } from '@/infrastructure/repositories/drizzle-shopping-list-dto-repository'
import { DrizzleShoppingListRepository } from '@/infrastructure/repositories/drizzle-shopping-list-repository'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HouseholdContext } from './context'

const shoppingListsRouter = new Hono<HouseholdContext>()

shoppingListsRouter.get('/:id', async (c) => {
  const householdId = c.get('householdId')
  const id = c.req.param('id')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListDtoRepository(db)
  const query = new GetShoppingListQueryHandler(repository)

  const result = await query.execute({ id }, { householdId })
  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_NOT_FOUND':
        console.error('Failed to get shopping list', {
          id,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
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
          console.error('Failed to create shopping list due to invalid name', {
            name,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 400)
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
    switch (result.error.type) {
      case 'SHOPPING_LIST_NOT_FOUND':
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to check shopping list item', {
          listId,
          itemId,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
    }
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
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to check shopping list item', {
          listId,
          itemId,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
    }
  }

  return c.json({ success: true })
})

export default shoppingListsRouter

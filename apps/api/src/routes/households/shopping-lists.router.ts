import {
  AddShoppingListItemCommandHandler,
  AddShoppingListItemCommandSchema,
} from '@/application/commands/add-shopping-list-item'
import {
  AddShoppingListItemFromInventoryCommandHandler,
  AddShoppingListItemFromInventoryCommandSchema,
} from '@/application/commands/add-shopping-list-item-from-inventory'
import { CheckShoppingListItemCommandHandler } from '@/application/commands/check-shopping-list-item'
import { ClearCheckedItemsCommandHandler } from '@/application/commands/clear-checked-items'
import {
  CreateShoppingListCommandHandler,
  CreateShoppingListCommandSchema,
} from '@/application/commands/create-shopping-list'
import { DeleteShoppingListCommandHandler } from '@/application/commands/delete-shopping-list'
import { RemoveShoppingListItemCommandHandler } from '@/application/commands/remove-shopping-list-item'
import {
  ReplaceShoppingListItemCommandHandler,
  ReplaceShoppingListItemCommandSchema,
} from '@/application/commands/replace-shopping-list-item'
import { UncheckShoppingListItemCommandHandler } from '@/application/commands/uncheck-shopping-list-item'
import { GetShoppingListQueryHandler } from '@/application/queries/get-shopping-list'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleInventoryItemRepository } from '@/infrastructure/repositories/drizzle-inventory-item-repository'
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
          console.error('Failed to create shopping list', {
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

shoppingListsRouter.delete('/:id', async (c) => {
  const householdId = c.get('householdId')
  const id = c.req.param('id')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const command = new DeleteShoppingListCommandHandler(repository)

  const result = await command.execute(id, { householdId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_NOT_FOUND':
        console.error('Failed to delete shopping list', {
          id,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
      case 'CANNOT_DELETE_LAST_SHOPPING_LIST':
        console.error('Failed to delete shopping list', {
          id,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 400)
    }
  }

  return c.json({ success: true })
})

shoppingListsRouter.post(
  '/:listId/items',
  zValidator('json', AddShoppingListItemCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const listId = c.req.param('listId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleShoppingListRepository(db)
    const command = new AddShoppingListItemCommandHandler(repository)

    const result = await command.execute(listId, input, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'SHOPPING_LIST_NOT_FOUND':
          console.error('Failed to add shopping list item', {
            listId,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 404)
        case 'INVALID_NAME':
        case 'INVALID_QUANTITY':
        case 'INVALID_UNIT':
        case 'UNIT_WITHOUT_VALUE':
          console.error('Failed to add shopping list item', {
            listId,
            input,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 400)
      }
    }

    return c.json({ success: true, data: { id: result.value } }, 201)
  },
)

shoppingListsRouter.post(
  '/:listId/items/from-inventory',
  zValidator('json', AddShoppingListItemFromInventoryCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const listId = c.req.param('listId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const shoppingListRepository = new DrizzleShoppingListRepository(db)
    const inventoryItemRepository = new DrizzleInventoryItemRepository(db)
    const command = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListRepository,
      inventoryItemRepository,
    )

    const result = await command.execute(listId, input, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'SHOPPING_LIST_NOT_FOUND':
        case 'INVENTORY_ITEM_NOT_FOUND':
          console.error('Failed to add shopping list item from inventory', {
            listId,
            inventoryItemId: input.inventoryItemId,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 404)
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
        console.error('Failed to uncheck shopping list item', {
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

shoppingListsRouter.post('/:listId/items/clear-checked', async (c) => {
  const householdId = c.get('householdId')
  const listId = c.req.param('listId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const command = new ClearCheckedItemsCommandHandler(repository)

  const result = await command.execute(listId, { householdId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_NOT_FOUND':
        console.error('Failed to clear checked items', {
          listId,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
    }
  }

  return c.json({ success: true })
})

shoppingListsRouter.put(
  '/:listId/items/:itemId',
  zValidator('json', ReplaceShoppingListItemCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const listId = c.req.param('listId')
    const itemId = c.req.param('itemId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleShoppingListRepository(db)
    const command = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await command.execute(listId, itemId, input, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'SHOPPING_LIST_NOT_FOUND':
        case 'SHOPPING_LIST_ITEM_NOT_FOUND':
          console.error('Failed to replace shopping list item', {
            listId,
            itemId,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 404)
        case 'INVALID_NAME':
        case 'INVALID_QUANTITY':
        case 'INVALID_UNIT':
        case 'UNIT_WITHOUT_VALUE':
          console.error('Failed to replace shopping list item', {
            listId,
            itemId,
            input,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 400)
      }
    }

    return c.json({ success: true })
  },
)

shoppingListsRouter.delete('/:listId/items/:itemId', async (c) => {
  const householdId = c.get('householdId')
  const listId = c.req.param('listId')
  const itemId = c.req.param('itemId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const command = new RemoveShoppingListItemCommandHandler(repository)

  const result = await command.execute(listId, itemId, { householdId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_NOT_FOUND':
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to remove shopping list item', {
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

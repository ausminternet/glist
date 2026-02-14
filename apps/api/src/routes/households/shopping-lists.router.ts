import { AddShoppingListItemCommandHandler } from '@/application/commands/add-shopping-list-item'
import { AddShoppingListItemFromInventoryCommandHandler } from '@/application/commands/add-shopping-list-item-from-inventory'
import { CheckShoppingListItemCommandHandler } from '@/application/commands/check-shopping-list-item'
import { ClearCheckedItemsCommandHandler } from '@/application/commands/clear-checked-items'
import { CreateShoppingListCommandHandler } from '@/application/commands/create-shopping-list'
import { DeleteShoppingListCommandHandler } from '@/application/commands/delete-shopping-list'
import { DeleteShoppingListItemPhotoCommandHandler } from '@/application/commands/delete-shopping-list-item-photo'
import { RemoveShoppingListItemCommandHandler } from '@/application/commands/remove-shopping-list-item'
import { ReplaceShoppingListItemCommandHandler } from '@/application/commands/replace-shopping-list-item'
import { UncheckShoppingListItemCommandHandler } from '@/application/commands/uncheck-shopping-list-item'
import { UploadShoppingListItemPhotoCommandHandler } from '@/application/commands/upload-shopping-list-item-photo'
import { GetShoppingListQueryHandler } from '@/application/queries/get-shopping-list'
import { GetShoppingListsQueryHandler } from '@/application/queries/get-shopping-lists'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleInventoryItemRepository } from '@/infrastructure/repositories/drizzle-inventory-item-repository'
import { DrizzleShoppingListQueryRepository } from '@/infrastructure/repositories/drizzle-shopping-list-query-repository'
import { DrizzleShoppingListRepository } from '@/infrastructure/repositories/drizzle-shopping-list-repository'
import { R2PhotoStorage } from '@/infrastructure/storage/photo-storage'
import { unitTypes } from '@glist/shared'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import type { HouseholdContext } from './context'

const shoppingListsRouter = new Hono<HouseholdContext>()

shoppingListsRouter.get('/', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListQueryRepository(db)
  const query = new GetShoppingListsQueryHandler(repository)

  const result = await query.execute({ householdId })

  return c.json({ success: true, data: result })
})

shoppingListsRouter.get('/:id', async (c) => {
  const householdId = c.get('householdId')
  const id = c.req.param('id')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListQueryRepository(db)
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

const CreateShoppingListCommandSchema = z.object({
  name: z.string().trim().nonempty('Name cannot be empty'),
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

  const result = await command.execute({ shoppingListId: id }, { householdId })

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

const AddShoppingListItemCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim().optional(),
  categoryId: z.uuid().optional(),
  quantity: z.number().positive().optional(),
  quantityUnit: z.enum(unitTypes).optional(),
  shopIds: z.array(z.uuid()).optional(),
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

    const result = await command.execute(
      { ...input, shoppingListId: listId },
      { householdId },
    )

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

const AddShoppingListItemFromInventoryCommandSchema = z.object({
  inventoryItemId: z.uuid(),
})

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

    const result = await command.execute(
      {
        inventoryItemId: input.inventoryItemId,
        shoppingListId: listId,
      },
      { householdId },
    )

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

  const result = await command.execute(
    { shoppingListId: listId },
    { householdId },
  )

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

const ReplaceShoppingListItemCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim().nullable(),
  categoryId: z.uuid().nullable(),
  quantity: z.number().positive().nullable(),
  quantityUnit: z.enum(unitTypes).nullable(),
  shopIds: z.array(z.uuid()),
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

    const result = await command.execute(
      { ...input, shoppingListId: listId, itemId },
      { householdId },
    )

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

  const result = await command.execute(
    {
      shoppingListId: listId,
      itemId,
    },
    { householdId },
  )

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

// Photo upload endpoint for shopping list items
shoppingListsRouter.post('/:listId/items/:itemId/photo', async (c) => {
  const householdId = c.get('householdId')
  const listId = c.req.param('listId')
  const itemId = c.req.param('itemId')

  const contentType = c.req.header('content-type')
  if (!contentType) {
    return c.json(
      { success: false, error: { type: 'MISSING_CONTENT_TYPE' } },
      400,
    )
  }

  const photoData = await c.req.arrayBuffer()
  if (!photoData || photoData.byteLength === 0) {
    return c.json({ success: false, error: { type: 'EMPTY_PHOTO_DATA' } }, 400)
  }

  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const photoStorage = new R2PhotoStorage(
    c.env.glist_photos,
    c.env.PHOTO_URL_BASE,
  )
  const command = new UploadShoppingListItemPhotoCommandHandler(
    repository,
    photoStorage,
  )

  const result = await command.execute(
    {
      shoppingListId: listId,
      itemId,
      photoData,
      contentType,
    },
    {
      householdId,
    },
  )

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_NOT_FOUND':
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to upload shopping list item photo', {
          listId,
          itemId,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
      case 'INVALID_CONTENT_TYPE':
        console.error('Failed to upload shopping list item photo', {
          listId,
          itemId,
          contentType,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 400)
    }
  }

  return c.json({ success: true, data: { photoUrl: result.value } }, 201)
})

// Photo delete endpoint for shopping list items
shoppingListsRouter.delete('/:listId/items/:itemId/photo', async (c) => {
  const householdId = c.get('householdId')
  const listId = c.req.param('listId')
  const itemId = c.req.param('itemId')

  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const photoStorage = new R2PhotoStorage(
    c.env.glist_photos,
    c.env.PHOTO_URL_BASE,
  )
  const command = new DeleteShoppingListItemPhotoCommandHandler(
    repository,
    photoStorage,
  )

  const result = await command.execute(
    {
      shoppingListId: listId,
      itemId,
    },
    { householdId },
  )

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_NOT_FOUND':
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to delete shopping list item photo', {
          listId,
          itemId,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
      case 'NO_PHOTO_EXISTS':
        console.error('Failed to delete shopping list item photo', {
          listId,
          itemId,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 400)
    }
  }

  return c.json({ success: true })
})

export default shoppingListsRouter

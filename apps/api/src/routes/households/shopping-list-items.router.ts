import { unitTypes } from '@glist/shared'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { AddShoppingListItemCommandHandler } from '@/application/commands/add-shopping-list-item'
import { AddShoppingListItemFromInventoryCommandHandler } from '@/application/commands/add-shopping-list-item-from-inventory'
import { CheckShoppingListItemCommandHandler } from '@/application/commands/check-shopping-list-item'
import { ClearCheckedItemsCommandHandler } from '@/application/commands/clear-checked-items'
import { DeleteShoppingListItemPhotoCommandHandler } from '@/application/commands/delete-shopping-list-item-photo'
import { RemoveShoppingListItemCommandHandler } from '@/application/commands/remove-shopping-list-item'
import { ReplaceShoppingListItemCommandHandler } from '@/application/commands/replace-shopping-list-item'
import { UncheckShoppingListItemCommandHandler } from '@/application/commands/uncheck-shopping-list-item'
import { UploadShoppingListItemPhotoCommandHandler } from '@/application/commands/upload-shopping-list-item-photo'
import { GetShoppingListItemsQueryHandler } from '@/application/queries/get-shopping-list-items'
import { broadcastShoppingListEvent } from '@/infrastructure/events/event-broadcaster'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleInventoryItemRepository } from '@/infrastructure/repositories/drizzle-inventory-item-repository'
import { DrizzleShoppingListItemQueryRepository } from '@/infrastructure/repositories/drizzle-shopping-list-item-query-repository'
import { DrizzleShoppingListItemRepository } from '@/infrastructure/repositories/drizzle-shopping-list-item-repository'
import { DrizzleShoppingListRepository } from '@/infrastructure/repositories/drizzle-shopping-list-repository'
import { R2PhotoStorage } from '@/infrastructure/storage/photo-storage'
import type { HouseholdContext } from './context'

const shoppingListItemsRouter = new Hono<HouseholdContext>()

shoppingListItemsRouter.get('/:listId/items', async (c) => {
  const listId = c.req.param('listId')
  const db = createDb(c.env.glist_db)
  const queryRepository = new DrizzleShoppingListItemQueryRepository(db)
  const query = new GetShoppingListItemsQueryHandler(queryRepository)

  const result = await query.execute({ listId })

  return c.json({ success: true, data: result })
})

const AddShoppingListItemCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim().optional(),
  categoryId: z.uuid().optional(),
  quantity: z.number().positive().optional(),
  quantityUnit: z.enum(unitTypes).optional(),
  shopIds: z.array(z.uuid()).optional(),
})

// Add a new item to a shopping list
shoppingListItemsRouter.post(
  '/:listId/items',
  zValidator('json', AddShoppingListItemCommandSchema),
  async (c) => {
    const listId = c.req.param('listId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const shoppingListRepository = new DrizzleShoppingListRepository(db)
    const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
    const command = new AddShoppingListItemCommandHandler(
      shoppingListRepository,
      shoppingListItemRepository,
    )

    const result = await command.execute({ ...input, shoppingListId: listId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'SHOPPING_LIST_NOT_FOUND':
          console.error('Failed to add shopping list item', {
            listId,
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
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 400)
      }
    }

    await broadcastShoppingListEvent(c.env, result.value.event)

    return c.json({ success: true, data: { id: result.value.value } }, 201)
  },
)

const AddShoppingListItemFromInventoryCommandSchema = z.object({
  inventoryItemId: z.uuid(),
})

// Add an item from inventory to a shopping list
shoppingListItemsRouter.post(
  '/:listId/items/from-inventory',
  zValidator('json', AddShoppingListItemFromInventoryCommandSchema),
  async (c) => {
    const listId = c.req.param('listId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
    const inventoryItemRepository = new DrizzleInventoryItemRepository(db)
    const command = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListItemRepository,
      inventoryItemRepository,
    )

    const result = await command.execute({
      inventoryItemId: input.inventoryItemId,
      shoppingListId: listId,
    })

    if (!result.ok) {
      switch (result.error.type) {
        case 'SHOPPING_LIST_NOT_FOUND':
        case 'INVENTORY_ITEM_NOT_FOUND':
          console.error('Failed to add shopping list item from inventory', {
            listId,
            inventoryItemId: input.inventoryItemId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 404)
      }
    }

    await broadcastShoppingListEvent(c.env, result.value.event)

    return c.json({ success: true, data: { id: result.value.value } }, 201)
  },
)

// Check a shopping list item
shoppingListItemsRouter.post('/:listId/items/:itemId/check', async (c) => {
  const listId = c.req.param('listId')
  const itemId = c.req.param('itemId')
  const db = createDb(c.env.glist_db)
  const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
  const command = new CheckShoppingListItemCommandHandler(
    shoppingListItemRepository,
  )

  const result = await command.execute({ itemId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to check shopping list item', {
          listId,
          itemId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
    }
  }

  await broadcastShoppingListEvent(c.env, result.value.event)

  return c.json({ success: true })
})

// Uncheck a shopping list item
shoppingListItemsRouter.post('/:listId/items/:itemId/uncheck', async (c) => {
  const listId = c.req.param('listId')
  const itemId = c.req.param('itemId')
  const db = createDb(c.env.glist_db)
  const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
  const command = new UncheckShoppingListItemCommandHandler(
    shoppingListItemRepository,
  )

  const result = await command.execute({ itemId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to uncheck shopping list item', {
          listId,
          itemId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
    }
  }

  await broadcastShoppingListEvent(c.env, result.value.event)

  return c.json({ success: true })
})

// Clear all checked items from a shopping list
shoppingListItemsRouter.post('/:listId/items/clear-checked', async (c) => {
  const listId = c.req.param('listId')
  const db = createDb(c.env.glist_db)
  const shoppingListRepository = new DrizzleShoppingListRepository(db)
  const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
  const command = new ClearCheckedItemsCommandHandler(
    shoppingListRepository,
    shoppingListItemRepository,
  )

  const result = await command.execute({ shoppingListId: listId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_NOT_FOUND':
        console.error('Failed to clear checked items', {
          listId,
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

// Replace/update a shopping list item
shoppingListItemsRouter.put(
  '/:listId/items/:itemId',
  zValidator('json', ReplaceShoppingListItemCommandSchema),
  async (c) => {
    const listId = c.req.param('listId')
    const itemId = c.req.param('itemId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
    const command = new ReplaceShoppingListItemCommandHandler(
      shoppingListItemRepository,
    )

    const result = await command.execute({ ...input, itemId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'SHOPPING_LIST_ITEM_NOT_FOUND':
          console.error('Failed to replace shopping list item', {
            listId,
            itemId,
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
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 400)
      }
    }

    await broadcastShoppingListEvent(c.env, result.value.event)

    return c.json({ success: true })
  },
)

// Remove a shopping list item
shoppingListItemsRouter.delete('/:listId/items/:itemId', async (c) => {
  const listId = c.req.param('listId')
  const itemId = c.req.param('itemId')
  const db = createDb(c.env.glist_db)
  const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
  const command = new RemoveShoppingListItemCommandHandler(
    shoppingListItemRepository,
  )

  const result = await command.execute({ itemId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to remove shopping list item', {
          listId,
          itemId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
    }
  }

  await broadcastShoppingListEvent(c.env, result.value.event)

  return c.json({ success: true })
})

// Upload a photo for a shopping list item
shoppingListItemsRouter.post('/:listId/items/:itemId/photo', async (c) => {
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
  const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
  const photoStorage = new R2PhotoStorage(
    c.env.glist_photos,
    c.env.PHOTO_URL_BASE,
  )
  const command = new UploadShoppingListItemPhotoCommandHandler(
    shoppingListItemRepository,
    photoStorage,
  )

  const result = await command.execute({
    itemId,
    photoData,
    contentType,
  })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to upload shopping list item photo', {
          listId,
          itemId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
      case 'INVALID_CONTENT_TYPE':
        console.error('Failed to upload shopping list item photo', {
          listId,
          itemId,
          contentType,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 400)
    }
  }

  return c.json({ success: true, data: { photoUrl: result.value } }, 201)
})

// Delete a photo from a shopping list item
shoppingListItemsRouter.delete('/:listId/items/:itemId/photo', async (c) => {
  const listId = c.req.param('listId')
  const itemId = c.req.param('itemId')

  const db = createDb(c.env.glist_db)
  const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
  const photoStorage = new R2PhotoStorage(
    c.env.glist_photos,
    c.env.PHOTO_URL_BASE,
  )
  const command = new DeleteShoppingListItemPhotoCommandHandler(
    shoppingListItemRepository,
    photoStorage,
  )

  const result = await command.execute({ itemId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to delete shopping list item photo', {
          listId,
          itemId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
      case 'NO_PHOTO_EXISTS':
        console.error('Failed to delete shopping list item photo', {
          listId,
          itemId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 400)
    }
  }

  return c.json({ success: true })
})

export default shoppingListItemsRouter

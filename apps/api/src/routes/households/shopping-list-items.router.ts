import {
  addShoppingListItemSchema,
  editShoppingListItemSchema,
} from '@glist/schemas'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { AddShoppingListItemCommandHandler } from '@/application/commands/add-shopping-list-item'
import { AddShoppingListItemFromInventoryCommandHandler } from '@/application/commands/add-shopping-list-item-from-inventory'
import { CheckShoppingListItemCommandHandler } from '@/application/commands/check-shopping-list-item'
import { ClearCheckedItemsCommandHandler } from '@/application/commands/clear-checked-items'
import { DeleteShoppingListItemCommandHandler } from '@/application/commands/delete-shopping-list-item'
import { DeleteShoppingListItemPhotoCommandHandler } from '@/application/commands/delete-shopping-list-item-photo'
import { EditShoppingListItemCommandHandler } from '@/application/commands/edit-shopping-list-item'
import { UncheckShoppingListItemCommandHandler } from '@/application/commands/uncheck-shopping-list-item'
import { UploadShoppingListItemPhotoCommandHandler } from '@/application/commands/upload-shopping-list-item-photo'
import { broadcastShoppingListEvent } from '@/infrastructure/events/event-broadcaster'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleInventoryItemRepository } from '@/infrastructure/repositories/drizzle-inventory-item-repository'
import { DrizzleShoppingListItemQueryRepository } from '@/infrastructure/repositories/drizzle-shopping-list-item-query-repository'
import { DrizzleShoppingListItemRepository } from '@/infrastructure/repositories/drizzle-shopping-list-item-repository'
import { R2PhotoStorage } from '@/infrastructure/storage/photo-storage'
import type { HouseholdContext } from './context'

const shoppingListItemsRouter = new Hono<HouseholdContext>()

shoppingListItemsRouter.get('/', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)
  const queryRepository = new DrizzleShoppingListItemQueryRepository(
    db,
    c.env.PHOTO_URL_BASE,
  )

  const items = await queryRepository.getAll(householdId)

  return c.json({ success: true, data: items })
})

// Add a new item to a shopping list
shoppingListItemsRouter.post(
  '/',
  zValidator('json', addShoppingListItemSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
    const command = new AddShoppingListItemCommandHandler(
      shoppingListItemRepository,
    )

    const result = await command.execute({ ...input }, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'INVALID_NAME':
        case 'INVALID_QUANTITY':
        case 'INVALID_UNIT':
        case 'UNIT_WITHOUT_VALUE':
          console.error('Failed to add shopping list item', {
            householdId,
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
  '/from-inventory',
  zValidator('json', AddShoppingListItemFromInventoryCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
    const inventoryItemRepository = new DrizzleInventoryItemRepository(db)
    const command = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListItemRepository,
      inventoryItemRepository,
    )

    const result = await command.execute(
      {
        inventoryItemId: input.inventoryItemId,
      },
      { householdId },
    )

    if (!result.ok) {
      switch (result.error.type) {
        case 'SHOPPING_LIST_NOT_FOUND':
        case 'INVENTORY_ITEM_NOT_FOUND':
          console.error('Failed to add shopping list item from inventory', {
            householdId,
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
shoppingListItemsRouter.post('/:itemId/check', async (c) => {
  const householdId = c.get('householdId')
  const itemId = c.req.param('itemId')
  const db = createDb(c.env.glist_db)
  const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
  const command = new CheckShoppingListItemCommandHandler(
    shoppingListItemRepository,
  )

  const result = await command.execute({ itemId }, { householdId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to check shopping list item', {
          householdId,
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
shoppingListItemsRouter.post('/:itemId/uncheck', async (c) => {
  const householdId = c.get('householdId')
  const itemId = c.req.param('itemId')
  const db = createDb(c.env.glist_db)
  const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
  const command = new UncheckShoppingListItemCommandHandler(
    shoppingListItemRepository,
  )

  const result = await command.execute({ itemId }, { householdId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to uncheck shopping list item', {
          householdId,
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
shoppingListItemsRouter.post('/clear-checked', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)
  const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
  const photoStorage = new R2PhotoStorage(
    c.env.glist_photos,
    c.env.PHOTO_URL_BASE,
  )
  const command = new ClearCheckedItemsCommandHandler(
    shoppingListItemRepository,
    photoStorage,
  )

  await command.execute({ householdId })

  return c.json({ success: true })
})

// Replace/update a shopping list item
shoppingListItemsRouter.patch(
  '/:itemId/edit',
  zValidator('json', editShoppingListItemSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const itemId = c.req.param('itemId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const shoppingListItemRepository = new DrizzleShoppingListItemRepository(db)
    const command = new EditShoppingListItemCommandHandler(
      shoppingListItemRepository,
    )

    const result = await command.execute({ ...input, itemId }, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'SHOPPING_LIST_ITEM_NOT_FOUND':
          console.error('Failed to replace shopping list item', {
            householdId,
            itemId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 404)
        case 'INVALID_NAME':
        case 'INVALID_QUANTITY':
        case 'INVALID_UNIT':
        case 'UNIT_WITHOUT_VALUE':
          console.error('Failed to replace shopping list item', {
            householdId,
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
shoppingListItemsRouter.delete('/:itemId', async (c) => {
  const householdId = c.get('householdId')
  const itemId = c.req.param('itemId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListItemRepository(db)
  const photoStorage = new R2PhotoStorage(
    c.env.glist_photos,
    c.env.PHOTO_URL_BASE,
  )
  const command = new DeleteShoppingListItemCommandHandler(
    repository,
    photoStorage,
  )

  await command.execute({ itemId }, { householdId })

  await broadcastShoppingListEvent(c.env, {
    type: 'item-removed',
    householdId,
    itemId,
  })

  return c.json({ success: true })
})

// Upload a photo for a shopping list item
shoppingListItemsRouter.post('/:itemId/photo', async (c) => {
  const householdId = c.get('householdId')
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

  const result = await command.execute(
    {
      itemId,
      photoData,
      contentType,
    },
    { householdId },
  )

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to upload shopping list item photo', {
          householdId,
          itemId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
      case 'INVALID_CONTENT_TYPE':
        console.error('Failed to upload shopping list item photo', {
          householdId,
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
shoppingListItemsRouter.delete('/:itemId/photo', async (c) => {
  const householdId = c.get('householdId')
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

  const result = await command.execute({ itemId }, { householdId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_ITEM_NOT_FOUND':
        console.error('Failed to delete shopping list item photo', {
          householdId,
          itemId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
      case 'NO_PHOTO_EXISTS':
        console.error('Failed to delete shopping list item photo', {
          householdId,
          itemId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 400)
    }
  }

  return c.json({ success: true })
})

export default shoppingListItemsRouter

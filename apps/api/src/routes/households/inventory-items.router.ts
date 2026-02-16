import { unitTypes } from '@glist/shared'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { CreateInventoryItemCommandHandler } from '@/application/commands/create-inventory-item'

import { DeleteInventoryItemPhotoCommandHandler } from '@/application/commands/delete-inventory-item-photo'
import { ReplaceInventoryItemCommandHandler } from '@/application/commands/replace-inventory-item'
import { UploadInventoryItemPhotoCommandHandler } from '@/application/commands/upload-inventory-item-photo'
import { GetInventoryItemsQueryHandler } from '@/application/queries/get-inventory-items'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleInventoryItemQueryRepository } from '@/infrastructure/repositories/drizzle-inventory-item-query-repository'
import { DrizzleInventoryItemRepository } from '@/infrastructure/repositories/drizzle-inventory-item-repository'
import { R2PhotoStorage } from '@/infrastructure/storage/photo-storage'
import type { HouseholdContext } from './context'

const inventoryItemsRouter = new Hono<HouseholdContext>()

inventoryItemsRouter.get('/', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleInventoryItemQueryRepository(db)
  const query = new GetInventoryItemsQueryHandler(repository)

  const items = await query.execute({ householdId })

  return c.json({ success: true, data: items })
})

const CreateInventoryItemCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim().optional(),
  categoryId: z.uuid().optional(),
  targetStock: z.number().positive().optional(),
  targetStockUnit: z.enum(unitTypes).optional(),
  basePriceCents: z.number().int().positive().optional(),
  basePriceUnit: z.enum(unitTypes).optional(),
  shopIds: z.array(z.uuid()).optional(),
})

inventoryItemsRouter.post(
  '/',
  zValidator('json', CreateInventoryItemCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleInventoryItemRepository(db)
    const command = new CreateInventoryItemCommandHandler(repository)

    const result = await command.execute(input, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'INVALID_NAME':
        case 'INVALID_PRICE':
        case 'PRICE_UNIT_WITHOUT_VALUE':
        case 'INVALID_QUANTITY':
        case 'INVALID_UNIT':
        case 'UNIT_WITHOUT_VALUE':
          console.error('Failed to create inventory item', {
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

const ReplaceInventoryItemCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim().nullable(),
  categoryId: z.uuid().nullable(),
  targetStock: z.number().positive().nullable(),
  targetStockUnit: z.enum(unitTypes).nullable(),
  basePriceCents: z.number().int().positive().nullable(),
  basePriceUnit: z.enum(unitTypes).nullable(),
  shopIds: z.array(z.uuid()),
})

inventoryItemsRouter.put(
  '/:id',
  zValidator('json', ReplaceInventoryItemCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const id = c.req.param('id')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleInventoryItemRepository(db)
    const command = new ReplaceInventoryItemCommandHandler(repository)

    const result = await command.execute({ ...input, inventoryItemId: id })

    if (!result.ok) {
      switch (result.error.type) {
        case 'INVENTORY_ITEM_NOT_FOUND':
          console.error('Failed to replace inventory item', {
            id,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 404)
        case 'INVALID_NAME':
        case 'INVALID_PRICE':
        case 'PRICE_UNIT_WITHOUT_VALUE':
        case 'INVALID_QUANTITY':
        case 'INVALID_UNIT':
        case 'UNIT_WITHOUT_VALUE':
          console.error('Failed to replace inventory item', {
            id,
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

inventoryItemsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id')

  const db = createDb(c.env.glist_db)
  const repository = new DrizzleInventoryItemRepository(db)
  await repository.delete(id)

  return c.json({ success: true })
})

inventoryItemsRouter.post('/:id/photo', async (c) => {
  const householdId = c.get('householdId')
  const id = c.req.param('id')

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
  const repository = new DrizzleInventoryItemRepository(db)
  const photoStorage = new R2PhotoStorage(
    c.env.glist_photos,
    c.env.PHOTO_URL_BASE,
  )
  const command = new UploadInventoryItemPhotoCommandHandler(
    repository,
    photoStorage,
  )

  const result = await command.execute({
    inventoryItemId: id,
    photoData,
    contentType,
  })

  if (!result.ok) {
    switch (result.error.type) {
      case 'INVENTORY_ITEM_NOT_FOUND':
        console.error('Failed to upload inventory item photo', {
          id,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
      case 'INVALID_CONTENT_TYPE':
        console.error('Failed to upload inventory item photo', {
          id,
          contentType,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 400)
    }
  }

  return c.json({ success: true, data: { photoUrl: result.value } }, 201)
})

inventoryItemsRouter.delete('/:id/photo', async (c) => {
  const householdId = c.get('householdId')
  const id = c.req.param('id')

  const db = createDb(c.env.glist_db)
  const repository = new DrizzleInventoryItemRepository(db)
  const photoStorage = new R2PhotoStorage(
    c.env.glist_photos,
    c.env.PHOTO_URL_BASE,
  )
  const command = new DeleteInventoryItemPhotoCommandHandler(
    repository,
    photoStorage,
  )

  const result = await command.execute({ inventoryItemId: id })

  if (!result.ok) {
    switch (result.error.type) {
      case 'INVENTORY_ITEM_NOT_FOUND':
        console.error('Failed to delete inventory item photo', {
          id,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
      case 'NO_PHOTO_EXISTS':
        console.error('Failed to delete inventory item photo', {
          id,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 400)
    }
  }

  return c.json({ success: true })
})

export default inventoryItemsRouter

import { UNIT_TYPES } from '@glist/shared'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { AddInventoryItemCommandHandler } from '@/application/commands/add-inventory-item'
import { DeleteInventoryItemCommandHandler } from '@/application/commands/delete-inventory-item'
import { EditInventoryItemCommandHandler } from '@/application/commands/edit-inventory-item'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleInventoryItemQueryRepository } from '@/infrastructure/repositories/drizzle-inventory-item-query-repository'
import { DrizzleInventoryItemRepository } from '@/infrastructure/repositories/drizzle-inventory-item-repository'
import type { HouseholdContext } from './context'

const inventoryItemsRouter = new Hono<HouseholdContext>()

inventoryItemsRouter.get('/', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)
  const queryRepository = new DrizzleInventoryItemQueryRepository(
    db,
    c.env.PHOTO_URL_BASE,
  )

  const items = await queryRepository.getAll(householdId)

  return c.json({ success: true, data: items })
})

const CreateInventoryItemCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim().nullable(),
  categoryId: z.uuid().nullable(),
  targetStock: z.number().positive().nullable(),
  targetStockUnit: z.enum(UNIT_TYPES).nullable(),
  basePriceCents: z.number().int().positive().nullable(),
  basePriceUnit: z.enum(UNIT_TYPES).nullable(),
  shopIds: z.array(z.uuid()),
  photoKeys: z.array(z.string()),
})

inventoryItemsRouter.post(
  '/',
  zValidator('json', CreateInventoryItemCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleInventoryItemRepository(db)
    const command = new AddInventoryItemCommandHandler(repository)

    const result = await command.execute(input, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'INVALID_NAME':
        case 'INVALID_PRICE':
        case 'INVALID_QUANTITY':
        case 'INVALID_UNIT':
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

const editInventoryItemCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim().nullable(),
  categoryId: z.uuid().nullable(),
  targetStock: z.number().positive().nullable(),
  targetStockUnit: z.enum(UNIT_TYPES).nullable(),
  basePriceCents: z.number().int().positive().nullable(),
  basePriceUnit: z.enum(UNIT_TYPES).nullable(),
  shopIds: z.array(z.uuid()),
  photoKeys: z.array(z.string()),
})

inventoryItemsRouter.patch(
  '/:id/edit',
  zValidator('json', editInventoryItemCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const id = c.req.param('id')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleInventoryItemRepository(db)
    const command = new EditInventoryItemCommandHandler(repository)

    const result = await command.execute(
      { ...input, itemId: id },
      { householdId },
    )

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
        case 'INVALID_QUANTITY':
        case 'INVALID_UNIT':
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
  const householdId = c.get('householdId')
  const id = c.req.param('id')

  const db = createDb(c.env.glist_db)
  const repository = new DrizzleInventoryItemRepository(db)

  const command = new DeleteInventoryItemCommandHandler(repository)

  await command.execute({ inventoryItemId: id }, { householdId })

  return c.json({ success: true })
})

export default inventoryItemsRouter

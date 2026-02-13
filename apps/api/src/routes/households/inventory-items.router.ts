import {
  CreateInventoryItemCommandHandler,
  CreateInventoryItemCommandSchema,
} from '@/application/commands/create-inventory-item'
import { DeleteInventoryItemCommandHandler } from '@/application/commands/delete-inventory-item'
import {
  ReplaceInventoryItemCommandHandler,
  ReplaceInventoryItemCommandSchema,
} from '@/application/commands/replace-inventory-item'
import { GetInventoryItemsQueryHandler } from '@/application/queries/get-inventory-items'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleInventoryItemDtoRepository } from '@/infrastructure/repositories/drizzle-inventory-item-dto-repository'
import { DrizzleInventoryItemRepository } from '@/infrastructure/repositories/drizzle-inventory-item-repository'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HouseholdContext } from './context'

const inventoryItemsRouter = new Hono<HouseholdContext>()

inventoryItemsRouter.get('/', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleInventoryItemDtoRepository(db)
  const query = new GetInventoryItemsQueryHandler(repository)

  const items = await query.execute({ householdId })

  return c.json({ success: true, data: items })
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

    const result = await command.execute(id, input, { householdId })

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
  const householdId = c.get('householdId')
  const id = c.req.param('id')

  const db = createDb(c.env.glist_db)
  const repository = new DrizzleInventoryItemRepository(db)
  const command = new DeleteInventoryItemCommandHandler(repository)

  const result = await command.execute(id, { householdId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'INVENTORY_ITEM_NOT_FOUND':
        console.error('Failed to delete inventory item', {
          id,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
    }
  }

  return c.json({ success: true })
})

export default inventoryItemsRouter

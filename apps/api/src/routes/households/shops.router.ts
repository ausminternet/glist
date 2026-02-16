import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { CreateShopCommandHandler } from '@/application/commands/create-shop'
import { DeleteShopCommandHandler } from '@/application/commands/delete-shop'
import { ReorderShopsCommandHandler } from '@/application/commands/reorder-shops'
import { ReplaceShopCommandHandler } from '@/application/commands/replace-shop'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleShopQueryRepository } from '@/infrastructure/repositories/drizzle-shop-query-repository'
import { DrizzleShopRepository } from '@/infrastructure/repositories/drizzle-shop-repository'
import type { HouseholdContext } from './context'

const shopsRouter = new Hono<HouseholdContext>()

shopsRouter.get('/', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShopQueryRepository(db)

  const shops = await repository.getAll(householdId)

  return c.json({ success: true, data: shops })
})

const CreateShopCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
})

shopsRouter.post(
  '/',
  zValidator('json', CreateShopCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleShopRepository(db)
    const command = new CreateShopCommandHandler(repository)

    const result = await command.execute(input, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'INVALID_NAME':
          console.error('Failed to create shop', {
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

const ReorderShopsCommandSchema = z.object({
  ids: z.array(z.uuid()).min(1, 'At least one shop id is required'),
})

shopsRouter.put(
  '/reorder',
  zValidator('json', ReorderShopsCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleShopRepository(db)
    const command = new ReorderShopsCommandHandler(repository)

    const result = await command.execute(input, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'SHOP_NOT_FOUND':
          console.error('Failed to reorder shops', {
            input,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 404)
        case 'SHOP_IDS_MISMATCH':
          console.error('Failed to reorder shops', {
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

const ReplaceShopCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
})

shopsRouter.put(
  '/:id',
  zValidator('json', ReplaceShopCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const id = c.req.param('id')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleShopRepository(db)
    const command = new ReplaceShopCommandHandler(repository)

    const result = await command.execute({ shopId: id, ...input })

    if (!result.ok) {
      switch (result.error.type) {
        case 'SHOP_NOT_FOUND':
          console.error('Failed to replace shop', {
            id,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 404)
        case 'INVALID_NAME':
          console.error('Failed to replace shop', {
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

shopsRouter.delete('/:id', async (c) => {
  const householdId = c.get('householdId')
  const id = c.req.param('id')

  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShopRepository(db)
  const command = new DeleteShopCommandHandler(repository)

  const result = await command.execute({ shopId: id })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOP_NOT_FOUND':
        console.error('Failed to delete shop', {
          id,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
    }
  }

  return c.json({ success: true })
})

export default shopsRouter

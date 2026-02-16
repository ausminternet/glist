import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { CreateHouseholdCommandHandler } from '@/application/commands/create-household'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleCategoryRepository } from '@/infrastructure/repositories/drizzle-category-repository'
import { DrizzleHouseholdQueryRepository } from '@/infrastructure/repositories/drizzle-household-query-repository'
import { DrizzleHouseholdRepository } from '@/infrastructure/repositories/drizzle-household-repository'
import { DrizzleShopRepository } from '@/infrastructure/repositories/drizzle-shop-repository'

const householdsRouter = new Hono<{ Bindings: CloudflareBindings }>()

householdsRouter.get('/', async (c) => {
  const db = createDb(c.env.glist_db)
  const householdQueryRepository = new DrizzleHouseholdQueryRepository(db)
  const allHouseholds = await householdQueryRepository.getAll()

  return c.json({ success: true, data: allHouseholds })
})

const CreateHouseholdSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  shopNames: z.array(z.string().trim().min(1)).optional(),
  categoryNames: z.array(z.string().trim().min(1)).optional(),
})

householdsRouter.post(
  '/',
  zValidator('json', CreateHouseholdSchema),
  async (c) => {
    const input = c.req.valid('json')
    const db = createDb(c.env.glist_db)

    const householdRepository = new DrizzleHouseholdRepository(db)
    const shopRepository = new DrizzleShopRepository(db)
    const categoryRepository = new DrizzleCategoryRepository(db)

    const command = new CreateHouseholdCommandHandler(
      householdRepository,
      shopRepository,
      categoryRepository,
    )

    const result = await command.execute(input)

    if (!result.ok) {
      return c.json({ success: false, error: result.error }, 400)
    }

    return c.json({ success: true, data: { id: result.value } }, 201)
  },
)

export default householdsRouter

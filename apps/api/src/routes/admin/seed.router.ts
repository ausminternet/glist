import { seed } from '@/infrastructure/persistence/seed'
import { Hono } from 'hono'

const seedRouter = new Hono<{ Bindings: CloudflareBindings }>()

seedRouter.post('/', async (c) => {
  const environment = c.env.ENVIRONMENT || 'production'

  if (environment === 'production') {
    return c.json(
      {
        success: false,
        error: 'Seeding is not allowed in production environment',
      },
      403,
    )
  }

  try {
    const result = await seed(c.env.glist_db!)
    return c.json({
      success: true,
      message: 'Database seeded successfully!',
      householdId: result.householdId,
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    )
  }
})

export default seedRouter

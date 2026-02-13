import { createDb } from '@/infrastructure/persistence'
import { households } from '@/infrastructure/persistence/schema'
import { Hono } from 'hono'
import adminRouter from './routes/admin'
import householdRouter from './routes/households'

const router = new Hono<{ Bindings: CloudflareBindings }>()

router.get('/', (c) => {
  return c.text('Hello Hono!')
})

router.get('/households', async (c) => {
  const db = createDb(c.env.glist_db)
  const allHouseholds = await db
    .select({ id: households.id, name: households.name })
    .from(households)

  return c.json({ success: true, data: allHouseholds })
})

router.route('/admin', adminRouter)
router.route('/households/:householdId', householdRouter)

export default router

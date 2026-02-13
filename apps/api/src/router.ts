import { Hono } from 'hono'
import adminRouter from './routes/admin'
import householdRouter from './routes/households'

const router = new Hono<{ Bindings: CloudflareBindings }>()

router.get('/', (c) => {
  return c.text('Hello Hono!')
})

router.route('/admin', adminRouter)
router.route('/households/:householdId', householdRouter)

export default router

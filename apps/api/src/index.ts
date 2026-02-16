import { Hono } from 'hono'
import serverKey from './middleware/server-key'
import adminRouter from './routes/admin'
import householdRouter from './routes/households'
import photosRouter from './routes/households/photos.router'
import householdsRouter from './routes/households.router'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.onError((err, c) => {
  console.error('An error occurred:', err)
  return c.json({ success: false, error: 'Internal Server Error' }, 500)
})

// Public routes (no API key required)
app.route('/photos', photosRouter)

// Protected routes (API key required)
const protectedRoutes = new Hono<{ Bindings: CloudflareBindings }>()
protectedRoutes.use(serverKey)
protectedRoutes.route('/households', householdsRouter)
protectedRoutes.route('/households/:householdId', householdRouter)
protectedRoutes.route('/admin', adminRouter)

app.route('/', protectedRoutes)

export default app

export { ShoppingListEventsDO } from './infrastructure/events/shopping-list-events-do.js'

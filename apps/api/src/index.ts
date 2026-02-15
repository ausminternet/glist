import { Hono } from 'hono'

const app = new Hono<{ Bindings: CloudflareBindings }>()

import serverKey from './middleware/server-key.js'
import router from './router.js'

app.use(serverKey)
app.onError((err, c) => {
  console.error('An error occurred:', err)
  return c.json({ success: false, error: 'Internal Server Error' }, 500)
})
app.route('/', router)

export default app

export { ShoppingListEventsDO } from './infrastructure/events/shopping-list-events-do.js'

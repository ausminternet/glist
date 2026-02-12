import { Hono } from 'hono'

const app = new Hono<{ Bindings: CloudflareBindings }>()

import serverKey from './middleware/server-key.js'
import v1Router from './router.js'

app.use(serverKey)

app.route('/v1', v1Router)

export default app

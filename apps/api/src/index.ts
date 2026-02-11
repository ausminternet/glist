import { Hono } from 'hono'

const app = new Hono<{ Bindings: CloudflareBindings }>()

import serverKey from './middleware/server-key.js'
import router from './router.js'

app.use(serverKey)

app.route('/v1', router)

export default app

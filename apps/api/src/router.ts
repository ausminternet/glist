import { Hono } from 'hono'
import adminRouter from './routes/v1/admin'
import householdRouter from './routes/v1/household'

const v1Router = new Hono<{ Bindings: CloudflareBindings }>()

v1Router.get('/', (c) => {
  return c.text('Hello Hono!')
})

v1Router.route('/admin', adminRouter)
v1Router.route('/households/:householdId', householdRouter)

export default v1Router

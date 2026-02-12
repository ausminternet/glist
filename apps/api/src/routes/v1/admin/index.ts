import { Hono } from 'hono'
import seedRouter from './seed'

const adminRouter = new Hono<{ Bindings: CloudflareBindings }>()

adminRouter.route('/seed', seedRouter)

export default adminRouter

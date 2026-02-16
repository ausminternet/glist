import { Hono } from 'hono'
import adminRouter from './routes/admin'
import householdRouter from './routes/households'
import photosRouter from './routes/households/photos.router'
import householdsRouter from './routes/households.router'

const router = new Hono<{ Bindings: CloudflareBindings }>()

router.route('/households', householdsRouter)
router.route('/households/:householdId', householdRouter)
router.route('/photos', photosRouter)
router.route('/admin', adminRouter)

export default router

import { createDb } from '@/infrastructure/persistence'
import { households } from '@/infrastructure/persistence/schema'
import { Hono } from 'hono'
import { R2PhotoStorage } from './infrastructure/storage/photo-storage'
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

router.get('/images/:key{.+}', async (c) => {
  const key = c.req.param('key')

  if (!key) {
    return c.text('Missing file key', 400)
  }

  const photoStorage = new R2PhotoStorage(
    c.env.glist_photos,
    c.env.PHOTO_URL_BASE,
  )
  try {
    const data = await photoStorage.get(key)
    return new Response(data.body, {
      headers: {
        'Content-Type':
          data.httpMetadata?.contentType ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    return c.text('File not found', 404)
  }
})

router.route('/admin', adminRouter)
router.route('/households/:householdId', householdRouter)

export default router

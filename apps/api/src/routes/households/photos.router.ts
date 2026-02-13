import { R2PhotoStorage } from '@/infrastructure/storage/photo-storage'
import { Hono } from 'hono'

const photosRouter = new Hono<{ Bindings: CloudflareBindings }>()

photosRouter.get('/:key{.+}', async (c) => {
  const key = c.req.param('key')

  if (!key) {
    return c.text('Missing file key', 400)
  }

  const photoStorage = new R2PhotoStorage(
    c.env.glist_photos,
    c.env.PHOTO_URL_BASE,
  )

  const result = await photoStorage.get(key)

  if (!result.ok) {
    switch (result.error.type) {
      case 'PHOTO_NOT_FOUND':
        console.error('Failed to load photo', {
          key,
        })
        return c.json({ success: false, error: result.error }, 404)
    }
  }

  return new Response(result.value.body, {
    headers: {
      'Content-Type':
        result.value.httpMetadata?.contentType ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
})

export default photosRouter

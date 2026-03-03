import { Hono } from 'hono'
import { UploadPhotoCommandHandler } from '@/application/commands/upload-photo'
import { R2PhotoStorage } from '@/infrastructure/storage/photo-storage'
import type { HouseholdContext } from './context'

const photosRouter = new Hono<HouseholdContext>()

photosRouter.post('/', async (c) => {
  const householdId = c.get('householdId')

  const contentType = c.req.header('content-type')
  if (!contentType) {
    return c.json(
      { success: false, error: { type: 'MISSING_CONTENT_TYPE' } },
      400,
    )
  }

  const photoData = await c.req.arrayBuffer()
  if (!photoData || photoData.byteLength === 0) {
    return c.json({ success: false, error: { type: 'EMPTY_PHOTO_DATA' } }, 400)
  }

  const photoStorage = new R2PhotoStorage(
    c.env.glist_photos,
    c.env.PHOTO_URL_BASE,
  )
  const command = new UploadPhotoCommandHandler(photoStorage)

  const result = await command.execute(
    { photoData, contentType },
    { householdId },
  )

  if (!result.ok) {
    switch (result.error.type) {
      case 'INVALID_CONTENT_TYPE':
        console.error('Failed to upload photo', {
          contentType,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 400)
    }
  }

  return c.json({ success: true, data: result.value }, 201)
})

export default photosRouter

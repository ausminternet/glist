import { err, ok, Result } from '@glist/shared'

export interface PhotoStorage {
  upload(key: string, data: ArrayBuffer, contentType: string): Promise<void>
  delete(key: string): Promise<void>
  getPublicUrl(key: string): string
}

type PhotoNotFoundError = {
  type: 'PHOTO_NOT_FOUND'
  key: string
}

export class R2PhotoStorage implements PhotoStorage {
  constructor(
    private bucket: R2Bucket,
    private publicUrlBase: string,
  ) {}

  async upload(
    key: string,
    data: ArrayBuffer,
    contentType: string,
  ): Promise<void> {
    await this.bucket.put(key, data, {
      httpMetadata: {
        contentType,
      },
    })
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key)
  }

  async get(key: string): Promise<Result<R2ObjectBody, PhotoNotFoundError>> {
    const object = await this.bucket.get(key)

    if (!object) {
      return err({ type: 'PHOTO_NOT_FOUND', key })
    }

    return ok(object)
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrlBase}/${key}`
  }
}

export function generatePhotoKey(
  type: 'inventory-item' | 'shopping-list-item',
  itemId: string,
): string {
  const timestamp = Date.now()
  return `${type}/${itemId}/${timestamp}.jpg`
}

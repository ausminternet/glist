import { err, ok, type Result } from '@glist/shared'
import {
  generatePhotoKey,
  type PhotoStorage,
} from '@/infrastructure/storage/photo-storage'
import type { RequestContext } from '../shared/request-context'

export type UploadPhotoError = {
  type: 'INVALID_CONTENT_TYPE'
  contentType: string
}

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export type UploadPhotoCommand = {
  photoData: ArrayBuffer
  contentType: string
}

export type UploadPhotoResult = {
  photoKey: string
  url: string
}

export class UploadPhotoCommandHandler {
  constructor(private photoStorage: PhotoStorage) {}

  async execute(
    command: UploadPhotoCommand,
    _context: RequestContext,
  ): Promise<Result<UploadPhotoResult, UploadPhotoError>> {
    if (!ALLOWED_CONTENT_TYPES.includes(command.contentType)) {
      return err({
        type: 'INVALID_CONTENT_TYPE',
        contentType: command.contentType,
      })
    }

    const photoKey = generatePhotoKey()
    await this.photoStorage.upload(
      photoKey,
      command.photoData,
      command.contentType,
    )

    const url = this.photoStorage.getPublicUrl(photoKey)

    return ok({
      photoKey,
      url,
    })
  }
}

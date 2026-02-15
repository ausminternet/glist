import { err, ok, type Result } from '@glist/shared'
import type { ShoppingListItemNotFoundError } from '@/domain/shopping-list-item/errors'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import {
  generatePhotoKey,
  type PhotoStorage,
} from '@/infrastructure/storage/photo-storage'
import type { RequestContext } from '../shared/request-context'

export type UploadShoppingListItemPhotoError =
  | ShoppingListItemNotFoundError
  | { type: 'INVALID_CONTENT_TYPE'; contentType: string }

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export type UploadShoppingListItemPhotoCommandInput = {
  shoppingListId: string
  itemId: string
  photoData: ArrayBuffer
  contentType: string
}

export type UploadShoppingListItemPhotoCommandOutput = {
  photoKey: string
}

export class UploadShoppingListItemPhotoCommandHandler {
  constructor(
    private shoppingListItemRepository: ShoppingListItemRepository,
    private photoStorage: PhotoStorage,
  ) {}

  async execute(
    command: UploadShoppingListItemPhotoCommandInput,
    _context: RequestContext,
  ): Promise<Result<string, UploadShoppingListItemPhotoError>> {
    if (!ALLOWED_CONTENT_TYPES.includes(command.contentType)) {
      return err({
        type: 'INVALID_CONTENT_TYPE',
        contentType: command.contentType,
      })
    }

    const item = await this.shoppingListItemRepository.findById(command.itemId)

    if (!item || item.shoppingListId !== command.shoppingListId) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: command.itemId })
    }

    if (item.photoKey) {
      await this.photoStorage.delete(item.photoKey)
    }

    const photoKey = generatePhotoKey('shopping-list-item', command.itemId)
    await this.photoStorage.upload(
      photoKey,
      command.photoData,
      command.contentType,
    )

    item.setPhotoKey(photoKey)
    await this.shoppingListItemRepository.save(item)

    const photoUrl = this.photoStorage.getPublicUrl(photoKey)

    return ok(photoUrl)
  }
}

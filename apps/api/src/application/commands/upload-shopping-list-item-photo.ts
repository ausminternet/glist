import { err, ok, type Result } from '@glist/shared'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import {
  generatePhotoKey,
  type PhotoStorage,
} from '@/infrastructure/storage/photo-storage'
import type { RequestContext } from '../shared/request-context'

export type UploadShoppingListItemPhotoError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | { type: 'SHOPPING_LIST_ITEM_NOT_FOUND'; id: string }
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
    private repository: ShoppingListRepository,
    private photoStorage: PhotoStorage,
  ) {}

  async execute(
    command: UploadShoppingListItemPhotoCommandInput,
    context: RequestContext,
  ): Promise<Result<string, UploadShoppingListItemPhotoError>> {
    const { householdId } = context

    if (!ALLOWED_CONTENT_TYPES.includes(command.contentType)) {
      return err({
        type: 'INVALID_CONTENT_TYPE',
        contentType: command.contentType,
      })
    }

    const shoppingList = await this.repository.findById(command.shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({
        type: 'SHOPPING_LIST_NOT_FOUND',
        id: command.shoppingListId,
      })
    }

    const item = shoppingList.findItem(command.itemId)

    if (!item) {
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
    await this.repository.save(shoppingList)

    const photoUrl = this.photoStorage.getPublicUrl(photoKey)

    return ok(photoUrl)
  }
}

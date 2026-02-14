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

export class UploadShoppingListItemPhotoCommandHandler {
  constructor(
    private repository: ShoppingListRepository,
    private photoStorage: PhotoStorage,
  ) {}

  async execute(
    shoppingListId: string,
    itemId: string,
    photoData: ArrayBuffer,
    contentType: string,
    context: RequestContext,
  ): Promise<Result<string, UploadShoppingListItemPhotoError>> {
    const { householdId } = context

    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return err({ type: 'INVALID_CONTENT_TYPE', contentType })
    }

    const shoppingList = await this.repository.findById(shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({ type: 'SHOPPING_LIST_NOT_FOUND', id: shoppingListId })
    }

    const item = shoppingList.findItem(itemId)

    if (!item) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: itemId })
    }

    if (item.photoKey) {
      await this.photoStorage.delete(item.photoKey)
    }

    const photoKey = generatePhotoKey('shopping-list-item', itemId)
    await this.photoStorage.upload(photoKey, photoData, contentType)

    item.setPhotoKey(photoKey)
    await this.repository.save(shoppingList)

    const photoUrl = this.photoStorage.getPublicUrl(photoKey)

    return ok(photoUrl)
  }
}

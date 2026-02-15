import { err, ok, type Result } from '@glist/shared'
import type { ShoppingListItemNotFoundError } from '@/domain/shopping-list-item/errors'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { PhotoStorage } from '@/infrastructure/storage/photo-storage'

export type DeleteShoppingListItemPhotoError =
  | ShoppingListItemNotFoundError
  | { type: 'NO_PHOTO_EXISTS' }

type DeleteShoppingListItemPhotoCommand = {
  itemId: string
}

export class DeleteShoppingListItemPhotoCommandHandler {
  constructor(
    private shoppingListItemRepository: ShoppingListItemRepository,
    private photoStorage: PhotoStorage,
  ) {}

  async execute(
    command: DeleteShoppingListItemPhotoCommand,
  ): Promise<Result<void, DeleteShoppingListItemPhotoError>> {
    const item = await this.shoppingListItemRepository.findById(command.itemId)

    if (!item) {
      return err({
        type: 'SHOPPING_LIST_ITEM_NOT_FOUND',
        id: command.itemId,
      })
    }

    if (!item.photoKey) {
      return err({ type: 'NO_PHOTO_EXISTS' })
    }

    await this.photoStorage.delete(item.photoKey)

    item.setPhotoKey(null)
    await this.shoppingListItemRepository.save(item)

    return ok(undefined)
  }
}

import { err, ok, type Result } from '@glist/shared'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import type { RequestContext } from '../shared/request-context'

export type DeleteShoppingListItemPhotoError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | { type: 'SHOPPING_LIST_ITEM_NOT_FOUND'; id: string }
  | { type: 'NO_PHOTO_EXISTS' }

type DeleteShoppingListItemPhotoCommand = {
  shoppingListId: string
  itemId: string
}

export class DeleteShoppingListItemPhotoCommandHandler {
  constructor(
    private repository: ShoppingListRepository,
    private photoStorage: PhotoStorage,
  ) {}

  async execute(
    command: DeleteShoppingListItemPhotoCommand,
    context: RequestContext,
  ): Promise<Result<void, DeleteShoppingListItemPhotoError>> {
    const { householdId } = context

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

    if (!item.photoKey) {
      return err({ type: 'NO_PHOTO_EXISTS' })
    }

    await this.photoStorage.delete(item.photoKey)

    item.setPhotoKey(null)
    await this.repository.save(shoppingList)

    return ok(undefined)
  }
}

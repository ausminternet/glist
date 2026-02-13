import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import { err, ok, Result } from '@glist/shared'
import { RequestContext } from '../shared/request-context'

export type DeleteShoppingListItemPhotoError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | { type: 'SHOPPING_LIST_ITEM_NOT_FOUND'; id: string }
  | { type: 'NO_PHOTO_EXISTS' }

export class DeleteShoppingListItemPhotoCommandHandler {
  constructor(
    private repository: ShoppingListRepository,
    private photoStorage: PhotoStorage,
  ) {}

  async execute(
    shoppingListId: string,
    itemId: string,
    context: RequestContext,
  ): Promise<Result<void, DeleteShoppingListItemPhotoError>> {
    const { householdId } = context

    const shoppingList = await this.repository.findById(shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({ type: 'SHOPPING_LIST_NOT_FOUND', id: shoppingListId })
    }

    const item = shoppingList.findItem(itemId)

    if (!item) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: itemId })
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

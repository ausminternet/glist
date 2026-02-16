import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import type { RequestContext } from '../shared/request-context'

export class ClearCheckedItemsCommandHandler {
  constructor(
    private shoppingListItemRepository: ShoppingListItemRepository,
    private photoStorage: PhotoStorage,
  ) {}

  async execute(context: RequestContext): Promise<void> {
    const checkedItems =
      await this.shoppingListItemRepository.findCheckedByHouseholdId(
        context.householdId,
      )

    const photoKeys = checkedItems
      .map((item) => item.photoKey)
      .filter((key): key is string => key !== null)

    await Promise.all(photoKeys.map((key) => this.photoStorage.delete(key)))

    await this.shoppingListItemRepository.deleteCheckedByHouseholdId(
      context.householdId,
    )
  }
}

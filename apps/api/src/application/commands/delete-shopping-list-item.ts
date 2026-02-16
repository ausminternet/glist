import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import type { RequestContext } from '../shared/request-context'

type DeleteShoppingListItemCommand = {
  itemId: string
}

export class DeleteShoppingListItemCommandHandler {
  constructor(
    private shoppingListItemRepository: ShoppingListItemRepository,
    private photoStorage: PhotoStorage,
  ) {}

  async execute(
    command: DeleteShoppingListItemCommand,
    context: RequestContext,
  ): Promise<void> {
    const item = await this.shoppingListItemRepository.findById(command.itemId)

    if (!item || item.householdId !== context.householdId) {
      return // Idempotent: not found = ok
    }

    if (item.photoKey) {
      await this.photoStorage.delete(item.photoKey)
    }

    await this.shoppingListItemRepository.delete(command.itemId)

    return
  }
}

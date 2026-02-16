import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { RequestContext } from '../shared/request-context'

export class ClearCheckedItemsCommandHandler {
  constructor(private shoppingListItemRepository: ShoppingListItemRepository) {}

  async execute(context: RequestContext): Promise<void> {
    await this.shoppingListItemRepository.deleteCheckedByHouseholdId(
      context.householdId,
    )
  }
}

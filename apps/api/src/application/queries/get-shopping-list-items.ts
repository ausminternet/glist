import type { ShoppingListItemView } from '@glist/views'
import type { ShoppingListItemQueryRepository } from '@/domain/shopping-list-item/shopping-list-item-query-repository'
import type { RequestContext } from '../shared/request-context'

export class GetShoppingListItemsQueryHandler {
  constructor(private queryRepository: ShoppingListItemQueryRepository) {}

  async execute(context: RequestContext): Promise<ShoppingListItemView[]> {
    return this.queryRepository.getAll(context.householdId)
  }
}

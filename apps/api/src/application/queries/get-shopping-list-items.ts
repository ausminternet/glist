import type { ShoppingListItemView } from '@glist/views'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { ShoppingListItemQueryRepository } from '@/domain/shopping-list-item/shopping-list-item-query-repository'
import type { RequestContext } from '../shared/request-context'

export interface GetShoppingListItemsQuery {
  listId: string
}

export class GetShoppingListItemsQueryHandler {
  constructor(
    private shoppingListRepository: ShoppingListRepository,
    private queryRepository: ShoppingListItemQueryRepository,
  ) {}

  async execute(
    query: GetShoppingListItemsQuery,
    context: RequestContext,
  ): Promise<ShoppingListItemView[]> {
    const { listId } = query
    const { householdId } = context

    // Verify the list belongs to the household
    const list = await this.shoppingListRepository.findById(listId)

    if (!list || list.householdId !== householdId) {
      return []
    }

    return this.queryRepository.findAllByShoppingListId(listId)
  }
}

import type { ShoppingListItemView } from '@glist/views'
import type { ShoppingListItemQueryRepository } from '@/domain/shopping-list-item/shopping-list-item-query-repository'

export interface GetShoppingListItemsQuery {
  listId: string
}

export class GetShoppingListItemsQueryHandler {
  constructor(private queryRepository: ShoppingListItemQueryRepository) {}

  async execute(
    query: GetShoppingListItemsQuery,
  ): Promise<ShoppingListItemView[]> {
    const { listId } = query

    return this.queryRepository.findAllByShoppingListId(listId)
  }
}

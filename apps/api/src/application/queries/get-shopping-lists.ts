import type { ShoppingListView } from '@glist/views'
import type { ShoppingListQueryRepository } from '@/domain/shopping-list/shopping-list-query-repository'
import type { RequestContext } from '../shared/request-context'

export class GetShoppingListsQueryHandler {
  constructor(private repository: ShoppingListQueryRepository) {}

  async execute(context: RequestContext): Promise<ShoppingListView[]> {
    const { householdId } = context

    const shoppingLists =
      await this.repository.findAllByHouseholdId(householdId)

    return shoppingLists
  }
}

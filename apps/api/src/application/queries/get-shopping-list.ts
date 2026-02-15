import { err, ok, type Result } from '@glist/shared'
import type { ShoppingListView } from '@glist/views'
import type { ShoppingListQueryRepository } from '@/domain/shopping-list/shopping-list-query-repository'
import type { RequestContext } from '../shared/request-context'

type GetShoppingListQueryError = { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }

export interface GetShoppingListQuery {
  id: string
}

export class GetShoppingListQueryHandler {
  constructor(private repository: ShoppingListQueryRepository) {}

  async execute(
    command: GetShoppingListQuery,
    context: RequestContext,
  ): Promise<Result<ShoppingListView, GetShoppingListQueryError>> {
    const { id } = command
    const { householdId } = context

    const shoppingList = await this.repository.find(id)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({ type: 'SHOPPING_LIST_NOT_FOUND', id })
    }

    return ok(shoppingList)
  }
}

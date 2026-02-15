import { err, ok, type Result } from '@glist/shared'
import type { ShoppingListView } from '@glist/views'
import type { ShoppingListQueryRepository } from '@/domain/shopping-list/shopping-list-query-repository'

type GetShoppingListQueryError = { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }

export interface GetShoppingListQuery {
  id: string
}

export class GetShoppingListQueryHandler {
  constructor(private repository: ShoppingListQueryRepository) {}

  async execute(
    command: GetShoppingListQuery,
  ): Promise<Result<ShoppingListView, GetShoppingListQueryError>> {
    const { id } = command

    const shoppingList = await this.repository.find(id)

    if (!shoppingList) {
      return err({ type: 'SHOPPING_LIST_NOT_FOUND', id })
    }

    return ok(shoppingList)
  }
}

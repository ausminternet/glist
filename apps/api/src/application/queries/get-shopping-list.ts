import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { ShoppingListDto } from '@glist/dtos'
import { err, ok, Result } from '@glist/shared'
import { toShoppingListDto } from '../mappers/shopping-list.mapper'
import { RequestContext } from '../shared/request-context'

type GetShoppingListQueryError = { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }

export interface GetShoppingListQuery {
  id: string
}

export class GetShoppingListQueryHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    command: GetShoppingListQuery,
    context: RequestContext,
  ): Promise<Result<ShoppingListDto, GetShoppingListQueryError>> {
    const { id } = command
    const { householdId } = context

    const shoppingList = await this.repository.findById(id)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({ type: 'SHOPPING_LIST_NOT_FOUND', id })
    }

    return ok(toShoppingListDto(shoppingList))
  }
}

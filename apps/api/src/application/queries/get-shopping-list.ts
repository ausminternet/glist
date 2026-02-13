import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { ShoppingListDto } from '@glist/dtos'
import { err, ok, Result } from '@glist/shared'
import { toShoppingListDto } from '../mappers/shopping-list.mapper'

type GetShoppingListQueryError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | { type: 'UNKNOWN_ERROR' }

export class GetShoppingListQuery {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    id: string,
    householdId: string,
  ): Promise<Result<ShoppingListDto, GetShoppingListQueryError>> {
    try {
      const shoppingList = await this.repository.findById(id)

      if (!shoppingList || shoppingList.householdId !== householdId) {
        return err({ type: 'SHOPPING_LIST_NOT_FOUND', id })
      }

      return ok(toShoppingListDto(shoppingList))
    } catch (error) {
      console.error('Error executing GetShoppingListQuery:', error)
      return err({ type: 'UNKNOWN_ERROR', id })
    }
  }
}

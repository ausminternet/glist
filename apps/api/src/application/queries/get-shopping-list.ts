import { ShoppingListNotFoundError } from '@/domain/shopping-list/errors'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { ShoppingListDto } from '@glist/dtos'
import { toShoppingListDto } from '../mappers/shopping-list.mapper'

export class GetShoppingListQuery {
  constructor(private repository: ShoppingListRepository) {}

  async execute(id: string, householdId: string): Promise<ShoppingListDto> {
    const shoppingList = await this.repository.findById(id)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      throw new ShoppingListNotFoundError(id)
    }

    return toShoppingListDto(shoppingList)
  }
}

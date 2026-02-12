import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { ShoppingListDto, toShoppingListDto } from '../dtos/shopping-list.dto'

export class ShoppingListNotFoundError extends Error {
  constructor(id: string) {
    super(`Shopping list not found: ${id}`)
    this.name = 'ShoppingListNotFoundError'
  }
}

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

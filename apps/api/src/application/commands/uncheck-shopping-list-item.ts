import {
  ShoppingListItemNotFoundError,
  ShoppingListNotFoundError,
} from '@/domain/shopping-list/errors'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'

export class UncheckShoppingListItemCommand {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    shoppingListId: string,
    itemId: string,
    householdId: string,
  ): Promise<void> {
    const shoppingList = await this.repository.findById(shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      throw new ShoppingListNotFoundError(shoppingListId)
    }

    const item = shoppingList.items.find((i) => i.id === itemId)

    if (!item) {
      throw new ShoppingListItemNotFoundError(itemId)
    }

    item.uncheck()
    await this.repository.save(shoppingList)
  }
}

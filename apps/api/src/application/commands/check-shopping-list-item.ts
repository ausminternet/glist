import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { err, ok, Result } from '@glist/shared'

type CheckShoppingListItemError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | { type: 'SHOPPING_LIST_ITEM_NOT_FOUND'; id: string }

export class CheckShoppingListItemCommand {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    shoppingListId: string,
    itemId: string,
    householdId: string,
  ): Promise<Result<void, CheckShoppingListItemError>> {
    const shoppingList = await this.repository.findById(shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({ type: 'SHOPPING_LIST_NOT_FOUND', id: shoppingListId })
    }

    const item = shoppingList.items.find((i) => i.id === itemId)

    if (!item) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: itemId })
    }

    item.check()
    await this.repository.save(shoppingList)

    return ok(undefined)
  }
}

import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository';
import { err, ok, Result } from '@glist/shared';
import { RequestContext } from '../shared/request-context';

export type RemoveShoppingListItemError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | { type: 'SHOPPING_LIST_ITEM_NOT_FOUND'; id: string }

export class RemoveShoppingListItemCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    shoppingListId: string,
    itemId: string,
    context: RequestContext,
  ): Promise<Result<void, RemoveShoppingListItemError>> {
    const { householdId } = context

    const shoppingList = await this.repository.findById(shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({ type: 'SHOPPING_LIST_NOT_FOUND', id: shoppingListId })
    }

    const removeResult = shoppingList.removeItem(itemId)

    if (!removeResult.ok) {
      return err(removeResult.error)
    }

    await this.repository.save(shoppingList)

    return ok(undefined)
  }
}

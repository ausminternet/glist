import { err, ok, type Result } from '@glist/shared'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { RequestContext } from '../shared/request-context'

type CheckShoppingListItemError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | { type: 'SHOPPING_LIST_ITEM_NOT_FOUND'; id: string }

export interface CheckShoppingListItemCommand {
  shoppingListId: string
  itemId: string
}

export class CheckShoppingListItemCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    command: CheckShoppingListItemCommand,
    context: RequestContext,
  ): Promise<Result<void, CheckShoppingListItemError>> {
    const { shoppingListId, itemId } = command
    const { householdId } = context

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

import { err, okWithEvent, type Result } from '@glist/shared'
import type { ItemUncheckedEvent } from '@/domain/shopping-list/events'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { RequestContext } from '../shared/request-context'

type UncheckShoppingListItemError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | { type: 'SHOPPING_LIST_ITEM_NOT_FOUND'; id: string }

export type UncheckShoppingListItemCommand = {
  shoppingListId: string
  itemId: string
}

type UncheckShoppingListItemResult = Result<
  { value: undefined; event: ItemUncheckedEvent },
  UncheckShoppingListItemError
>

export class UncheckShoppingListItemCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    command: UncheckShoppingListItemCommand,
    context: RequestContext,
  ): Promise<UncheckShoppingListItemResult> {
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

    item.uncheck()
    await this.repository.save(shoppingList)

    return okWithEvent(undefined, {
      type: 'item-unchecked',
      listId: shoppingListId,
      itemId,
    })
  }
}

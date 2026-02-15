import { err, okWithEvent, type Result } from '@glist/shared'
import type { ItemRemovedEvent } from '@/domain/shopping-list/events'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { RequestContext } from '../shared/request-context'

export type RemoveShoppingListItemError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | { type: 'SHOPPING_LIST_ITEM_NOT_FOUND'; id: string }

type RemoveShoppingListItemCommandInput = {
  shoppingListId: string
  itemId: string
}

type RemoveShoppingListItemResult = Result<
  { value: undefined; event: ItemRemovedEvent },
  RemoveShoppingListItemError
>

export class RemoveShoppingListItemCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    command: RemoveShoppingListItemCommandInput,
    context: RequestContext,
  ): Promise<RemoveShoppingListItemResult> {
    const { householdId } = context

    const shoppingList = await this.repository.findById(command.shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({
        type: 'SHOPPING_LIST_NOT_FOUND',
        id: command.shoppingListId,
      })
    }

    const removeResult = shoppingList.removeItem(command.itemId)

    if (!removeResult.ok) {
      return err(removeResult.error)
    }

    await this.repository.save(shoppingList)

    return okWithEvent(undefined, {
      type: 'item-removed',
      listId: command.shoppingListId,
      itemId: command.itemId,
    })
  }
}

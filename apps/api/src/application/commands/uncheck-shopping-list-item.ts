import { err, okWithEvent, type Result } from '@glist/shared'
import type { ItemUncheckedEvent } from '@/domain/shopping-list/events'
import type { ShoppingListItemNotFoundError } from '@/domain/shopping-list-item/errors'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { RequestContext } from '../shared/request-context'

type UncheckShoppingListItemError = ShoppingListItemNotFoundError

export type UncheckShoppingListItemCommand = {
  shoppingListId: string
  itemId: string
}

type UncheckShoppingListItemResult = Result<
  { value: undefined; event: ItemUncheckedEvent },
  UncheckShoppingListItemError
>

export class UncheckShoppingListItemCommandHandler {
  constructor(private shoppingListItemRepository: ShoppingListItemRepository) {}

  async execute(
    command: UncheckShoppingListItemCommand,
    _context: RequestContext,
  ): Promise<UncheckShoppingListItemResult> {
    const { shoppingListId, itemId } = command

    const item = await this.shoppingListItemRepository.findById(itemId)

    if (!item || item.shoppingListId !== shoppingListId) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: itemId })
    }

    item.uncheck()
    await this.shoppingListItemRepository.save(item)

    return okWithEvent(undefined, {
      type: 'item-unchecked',
      listId: shoppingListId,
      itemId,
    })
  }
}

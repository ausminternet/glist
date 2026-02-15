import { err, okWithEvent, type Result } from '@glist/shared'
import type { ItemCheckedEvent } from '@/domain/shopping-list/events'
import type { ShoppingListItemNotFoundError } from '@/domain/shopping-list-item/errors'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { RequestContext } from '../shared/request-context'

type CheckShoppingListItemError = ShoppingListItemNotFoundError

export interface CheckShoppingListItemCommand {
  shoppingListId: string
  itemId: string
}

type CheckShoppingListItemResult = Result<
  { value: undefined; event: ItemCheckedEvent },
  CheckShoppingListItemError
>

export class CheckShoppingListItemCommandHandler {
  constructor(private shoppingListItemRepository: ShoppingListItemRepository) {}

  async execute(
    command: CheckShoppingListItemCommand,
    _context: RequestContext,
  ): Promise<CheckShoppingListItemResult> {
    const { shoppingListId, itemId } = command

    const item = await this.shoppingListItemRepository.findById(itemId)

    if (!item || item.shoppingListId !== shoppingListId) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: itemId })
    }

    item.check()
    await this.shoppingListItemRepository.save(item)

    return okWithEvent(undefined, {
      type: 'item-checked',
      listId: shoppingListId,
      itemId,
    })
  }
}

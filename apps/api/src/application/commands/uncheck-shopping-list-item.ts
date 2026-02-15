import { err, okWithEvent, type Result } from '@glist/shared'
import type { ItemUncheckedEvent } from '@/domain/shopping-list/events'
import type { ShoppingListItemNotFoundError } from '@/domain/shopping-list-item/errors'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'

type UncheckShoppingListItemError = ShoppingListItemNotFoundError

export type UncheckShoppingListItemCommand = {
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
  ): Promise<UncheckShoppingListItemResult> {
    const { itemId } = command

    const item = await this.shoppingListItemRepository.findById(itemId)

    if (!item) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: itemId })
    }

    item.uncheck()
    await this.shoppingListItemRepository.save(item)

    return okWithEvent(undefined, {
      type: 'item-unchecked',
      listId: item.shoppingListId,
      itemId,
    })
  }
}

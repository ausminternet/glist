import { err, okWithEvent, type Result } from '@glist/shared'
import type { ItemRemovedEvent } from '@/domain/shopping-list/events'
import type { ShoppingListItemNotFoundError } from '@/domain/shopping-list-item/errors'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'

export type RemoveShoppingListItemError = ShoppingListItemNotFoundError

type RemoveShoppingListItemCommandInput = {
  itemId: string
}

type RemoveShoppingListItemResult = Result<
  { value: undefined; event: ItemRemovedEvent },
  RemoveShoppingListItemError
>

export class RemoveShoppingListItemCommandHandler {
  constructor(private shoppingListItemRepository: ShoppingListItemRepository) {}

  async execute(
    command: RemoveShoppingListItemCommandInput,
  ): Promise<RemoveShoppingListItemResult> {
    const item = await this.shoppingListItemRepository.findById(command.itemId)

    if (!item) {
      return err({
        type: 'SHOPPING_LIST_ITEM_NOT_FOUND',
        id: command.itemId,
      })
    }

    await this.shoppingListItemRepository.delete(command.itemId)

    return okWithEvent(undefined, {
      type: 'item-removed',
      listId: item.shoppingListId,
      itemId: command.itemId,
    })
  }
}

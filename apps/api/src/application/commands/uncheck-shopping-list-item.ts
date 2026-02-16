import { err, okWithEvent, type Result } from '@glist/shared'
import type { ShoppingListItemNotFoundError } from '@/domain/shopping-list-item/errors'
import type { ItemUncheckedEvent } from '@/domain/shopping-list-item/events'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { RequestContext } from '../shared/request-context'

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
    context: RequestContext,
  ): Promise<UncheckShoppingListItemResult> {
    const { itemId } = command

    const item = await this.shoppingListItemRepository.findById(itemId)

    if (!item || item.householdId !== context.householdId) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: itemId })
    }

    item.uncheck()
    await this.shoppingListItemRepository.save(item)

    return okWithEvent(undefined, {
      type: 'item-unchecked',
      householdId: item.householdId,
      itemId,
    })
  }
}

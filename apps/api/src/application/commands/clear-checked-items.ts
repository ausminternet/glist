import { err, ok, type Result } from '@glist/shared'
import type { ShoppingListNotFoundError } from '@/domain/shopping-list/errors'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'

export type ClearCheckedItemsError = ShoppingListNotFoundError

export type ClearCheckedItemsCommand = {
  shoppingListId: string
}

export class ClearCheckedItemsCommandHandler {
  constructor(
    private shoppingListRepository: ShoppingListRepository,
    private shoppingListItemRepository: ShoppingListItemRepository,
  ) {}

  async execute(
    command: ClearCheckedItemsCommand,
  ): Promise<Result<void, ClearCheckedItemsError>> {
    const shoppingList = await this.shoppingListRepository.findById(
      command.shoppingListId,
    )

    if (!shoppingList) {
      return err({
        type: 'SHOPPING_LIST_NOT_FOUND',
        id: command.shoppingListId,
      })
    }

    await this.shoppingListItemRepository.deleteCheckedByShoppingListId(
      command.shoppingListId,
    )

    return ok(undefined)
  }
}

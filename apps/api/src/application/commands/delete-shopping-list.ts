import { err, ok, type Result } from '@glist/shared'
import type {
  CannotDeleteLastShoppingListError,
  ShoppingListNotFoundError,
} from '@/domain/shopping-list/errors'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'

export type DeleteShoppingListError =
  | ShoppingListNotFoundError
  | CannotDeleteLastShoppingListError

export type DeleteShoppingListCommand = {
  shoppingListId: string
}

export class DeleteShoppingListCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    command: DeleteShoppingListCommand,
  ): Promise<Result<void, DeleteShoppingListError>> {
    const shoppingList = await this.repository.findById(command.shoppingListId)

    if (!shoppingList) {
      return err({
        type: 'SHOPPING_LIST_NOT_FOUND',
        id: command.shoppingListId,
      })
    }

    const count = await this.repository.countByHouseholdId(
      shoppingList.householdId,
    )

    if (count <= 1) {
      return err({ type: 'CANNOT_DELETE_LAST_SHOPPING_LIST' })
    }

    await this.repository.delete(command.shoppingListId)

    return ok(undefined)
  }
}

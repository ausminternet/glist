import { err, ok, type Result } from '@glist/shared'
import type {
  CannotDeleteLastShoppingListError,
  ShoppingListNotFoundError,
} from '@/domain/shopping-list/errors'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { RequestContext } from '../shared/request-context'

export type DeleteShoppingListError =
  | ShoppingListNotFoundError
  | CannotDeleteLastShoppingListError

export class DeleteShoppingListCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    shoppingListId: string,
    context: RequestContext,
  ): Promise<Result<void, DeleteShoppingListError>> {
    const { householdId } = context

    const shoppingList = await this.repository.findById(shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({ type: 'SHOPPING_LIST_NOT_FOUND', id: shoppingListId })
    }

    const count = await this.repository.countByHouseholdId(householdId)

    if (count <= 1) {
      return err({ type: 'CANNOT_DELETE_LAST_SHOPPING_LIST' })
    }

    await this.repository.delete(shoppingListId)

    return ok(undefined)
  }
}

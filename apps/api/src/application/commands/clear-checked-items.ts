import { err, ok, type Result } from '@glist/shared'
import type { ShoppingListNotFoundError } from '@/domain/shopping-list/errors'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { RequestContext } from '../shared/request-context'

export type ClearCheckedItemsError = ShoppingListNotFoundError

export class ClearCheckedItemsCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    shoppingListId: string,
    context: RequestContext,
  ): Promise<Result<void, ClearCheckedItemsError>> {
    const { householdId } = context

    const shoppingList = await this.repository.findById(shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({ type: 'SHOPPING_LIST_NOT_FOUND', id: shoppingListId })
    }

    shoppingList.clearChecked()

    await this.repository.save(shoppingList)

    return ok(undefined)
  }
}

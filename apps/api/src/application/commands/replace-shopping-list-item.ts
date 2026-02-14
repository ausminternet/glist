import { parseCategoryId } from '@/domain/category/category-id'
import { parseShopIds } from '@/domain/shop/shop-id'
import {
  ShoppingListItemNotFoundError,
  ShoppingListNotFoundError,
} from '@/domain/shopping-list/errors'
import {
  ChangeNameError,
  ChangeQuantityError,
} from '@/domain/shopping-list/shopping-list-item'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { err, ok, Result } from '@glist/shared'
import { RequestContext } from '../shared/request-context'

export type ReplaceShoppingListItemCommand = {
  itemId: string
  shoppingListId: string
  name: string
  description: string | null
  categoryId: string | null
  quantity: number | null
  quantityUnit: string | null
  shopIds: string[]
}

export type ReplaceShoppingListItemError =
  | ShoppingListNotFoundError
  | ShoppingListItemNotFoundError
  | ChangeNameError
  | ChangeQuantityError

export class ReplaceShoppingListItemCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    command: ReplaceShoppingListItemCommand,
    context: RequestContext,
  ): Promise<Result<void, ReplaceShoppingListItemError>> {
    const { householdId } = context

    const shoppingList = await this.repository.findById(command.shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({
        type: 'SHOPPING_LIST_NOT_FOUND',
        id: command.shoppingListId,
      })
    }

    const item = shoppingList.findItem(command.itemId)

    if (!item) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: command.itemId })
    }

    const nameResult = item.changeName(command.name)
    if (!nameResult.ok) {
      return err(nameResult.error)
    }

    item.changeDescription(command.description)

    item.changeCategory(
      command.categoryId ? parseCategoryId(command.categoryId) : null,
    )

    const quantityResult = item.changeQuantity(
      command.quantity,
      command.quantityUnit,
    )
    if (!quantityResult.ok) {
      return err(quantityResult.error)
    }

    item.changeShops(parseShopIds(command.shopIds))

    await this.repository.save(shoppingList)

    return ok(undefined)
  }
}

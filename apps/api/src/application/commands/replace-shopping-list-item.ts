import { err, okWithEvent, type Result } from '@glist/shared'
import { parseCategoryId } from '@/domain/category/category-id'
import { parseShopIds } from '@/domain/shop/shop-id'
import type {
  ShoppingListItemNotFoundError,
  ShoppingListNotFoundError,
} from '@/domain/shopping-list/errors'
import type { ItemUpdatedEvent } from '@/domain/shopping-list/events'
import type {
  ChangeNameError,
  ChangeQuantityError,
} from '@/domain/shopping-list/shopping-list-item'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { RequestContext } from '../shared/request-context'

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

type ReplaceShoppingListItemResult = Result<
  { value: undefined; event: ItemUpdatedEvent },
  ReplaceShoppingListItemError
>

export class ReplaceShoppingListItemCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    command: ReplaceShoppingListItemCommand,
    context: RequestContext,
  ): Promise<ReplaceShoppingListItemResult> {
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
      return err({
        type: 'SHOPPING_LIST_ITEM_NOT_FOUND',
        id: command.itemId,
      })
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

    return okWithEvent(undefined, {
      type: 'item-updated',
      listId: command.shoppingListId,
      itemId: command.itemId,
    })
  }
}

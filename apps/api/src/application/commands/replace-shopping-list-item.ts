import { err, okWithEvent, type Result } from '@glist/shared'
import { parseCategoryId } from '@/domain/category/category-id'
import { parseShopIds } from '@/domain/shop/shop-id'
import type { ItemUpdatedEvent } from '@/domain/shopping-list/events'
import type { ShoppingListItemNotFoundError } from '@/domain/shopping-list-item/errors'
import type {
  ChangeNameError,
  ChangeQuantityError,
} from '@/domain/shopping-list-item/shopping-list-item'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
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
  | ShoppingListItemNotFoundError
  | ChangeNameError
  | ChangeQuantityError

type ReplaceShoppingListItemResult = Result<
  { value: undefined; event: ItemUpdatedEvent },
  ReplaceShoppingListItemError
>

export class ReplaceShoppingListItemCommandHandler {
  constructor(private shoppingListItemRepository: ShoppingListItemRepository) {}

  async execute(
    command: ReplaceShoppingListItemCommand,
    _context: RequestContext,
  ): Promise<ReplaceShoppingListItemResult> {
    const item = await this.shoppingListItemRepository.findById(command.itemId)

    if (!item || item.shoppingListId !== command.shoppingListId) {
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

    await this.shoppingListItemRepository.save(item)

    return okWithEvent(undefined, {
      type: 'item-updated',
      listId: command.shoppingListId,
      itemId: command.itemId,
    })
  }
}

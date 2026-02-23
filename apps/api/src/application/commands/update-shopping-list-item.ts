import { err, okWithEvent, type Result } from '@glist/shared'
import { parseCategoryId } from '@/domain/category/category-id'
import { parseShopIds } from '@/domain/shop/shop-id'
import type { ShoppingListItemNotFoundError } from '@/domain/shopping-list-item/errors'
import type { ItemUpdatedEvent } from '@/domain/shopping-list-item/events'
import type {
  ChangeNameError,
  ChangeQuantityError,
} from '@/domain/shopping-list-item/shopping-list-item'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { RequestContext } from '../shared/request-context'

export type UpdateShoppingListItemCommand = {
  itemId: string
  name?: string
  description?: string | null
  categoryId?: string | null
  quantity?: number | null
  quantityUnit?: string | null
  shopIds?: string[]
}

export type UpdateShoppingListItemError =
  | ShoppingListItemNotFoundError
  | ChangeNameError
  | ChangeQuantityError

type ReplaceShoppingListItemResult = Result<
  { value: undefined; event: ItemUpdatedEvent },
  UpdateShoppingListItemError
>

export class UpdateShoppingListItemCommandHandler {
  constructor(private shoppingListItemRepository: ShoppingListItemRepository) {}

  async execute(
    command: UpdateShoppingListItemCommand,
    context: RequestContext,
  ): Promise<ReplaceShoppingListItemResult> {
    const item = await this.shoppingListItemRepository.findById(command.itemId)

    if (!item || item.householdId !== context.householdId) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: command.itemId })
    }

    if (command.name !== undefined) {
      const nameResult = item.changeName(command.name)
      if (!nameResult.ok) return err(nameResult.error)
    }

    if (command.description !== undefined) {
      item.changeDescription(command.description)
    }

    if (command.categoryId !== undefined) {
      item.changeCategory(
        command.categoryId ? parseCategoryId(command.categoryId) : null,
      )
    }

    if (command.quantity !== undefined || command.quantityUnit !== undefined) {
      const quantityResult = item.changeQuantity(
        command.quantity ?? null,
        command.quantityUnit ?? null,
      )
      if (!quantityResult.ok) return err(quantityResult.error)
    }

    if (command.shopIds !== undefined) {
      item.changeShops(parseShopIds(command.shopIds))
    }

    await this.shoppingListItemRepository.save(item)

    return okWithEvent(undefined, {
      type: 'item-updated',
      householdId: item.householdId,
      itemId: command.itemId,
    })
  }
}

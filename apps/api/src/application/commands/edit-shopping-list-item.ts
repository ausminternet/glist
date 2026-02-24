import { err, okWithEvent, type Result } from '@glist/shared'
import { parseCategoryId } from '@/domain/category/category-id'
import { parseShopIds } from '@/domain/shop/shop-id'
import type { ShoppingListItemNotFoundError } from '@/domain/shopping-list-item/errors'
import type { ItemEditedEvent } from '@/domain/shopping-list-item/events'
import type { EditShoppingListItemError as EditShoppingListItemAggregateError } from '@/domain/shopping-list-item/shopping-list-item'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { RequestContext } from '../shared/request-context'

export type EditShoppingListItemCommand = {
  itemId: string
  name: string
  description: string | null
  categoryId: string | null
  quantity: number | null
  quantityUnit: string | null
  shopIds: string[]
}

export type EditShoppingListItemError =
  | ShoppingListItemNotFoundError
  | EditShoppingListItemAggregateError

type EditShoppingListItemResult = Result<
  { value: undefined; event: ItemEditedEvent },
  EditShoppingListItemError
>

export class EditShoppingListItemCommandHandler {
  constructor(private shoppingListItemRepository: ShoppingListItemRepository) {}

  async execute(
    command: EditShoppingListItemCommand,
    context: RequestContext,
  ): Promise<EditShoppingListItemResult> {
    const item = await this.shoppingListItemRepository.findById(command.itemId)

    if (!item || item.householdId !== context.householdId) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: command.itemId })
    }

    item.edit({
      name: command.name,
      description: command.description,
      categoryId: command.categoryId
        ? parseCategoryId(command.categoryId)
        : null,
      quantity: command.quantity,
      quantityUnit: command.quantityUnit,
      shopIds: parseShopIds(command.shopIds),
    })

    await this.shoppingListItemRepository.save(item)

    return okWithEvent(undefined, {
      type: 'item-edited',
      householdId: item.householdId,
      itemId: command.itemId,
    })
  }
}

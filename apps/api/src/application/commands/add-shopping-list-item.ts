import { err, okWithEvent, type Result } from '@glist/shared'
import { parseCategoryId } from '@/domain/category/category-id'
import { parseShopIds } from '@/domain/shop/shop-id'
import type { ItemAddedEvent } from '@/domain/shopping-list-item/events'
import {
  type CreateShoppingListItemError,
  ShoppingListItem,
} from '@/domain/shopping-list-item/shopping-list-item'
import { generateShoppingListItemId } from '@/domain/shopping-list-item/shopping-list-item-id'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { RequestContext } from '../shared/request-context'

export type AddShoppingListItemCommand = {
  name: string
  description?: string
  categoryId?: string
  quantity?: number
  quantityUnit?: string
  shopIds?: string[]
}

export type AddShoppingListItemError = CreateShoppingListItemError

type AddShoppingListItemResult = Result<
  { value: string; event: ItemAddedEvent },
  AddShoppingListItemError
>

export class AddShoppingListItemCommandHandler {
  constructor(private shoppingListItemRepository: ShoppingListItemRepository) {}

  async execute(
    command: AddShoppingListItemCommand,
    context: RequestContext,
  ): Promise<AddShoppingListItemResult> {
    const itemResult = ShoppingListItem.create(generateShoppingListItemId(), {
      householdId: context.householdId,
      name: command.name,
      description: command.description,
      categoryId: command.categoryId
        ? parseCategoryId(command.categoryId)
        : undefined,
      quantity: command.quantity,
      quantityUnit: command.quantityUnit,
      shopIds: command.shopIds ? parseShopIds(command.shopIds) : undefined,
    })

    if (!itemResult.ok) {
      return err(itemResult.error)
    }

    await this.shoppingListItemRepository.save(itemResult.value)

    return okWithEvent(itemResult.value.id, {
      type: 'item-added',
      householdId: context.householdId,
      itemId: itemResult.value.id,
    })
  }
}

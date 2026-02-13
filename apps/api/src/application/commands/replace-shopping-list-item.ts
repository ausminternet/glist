import { parseCategoryId } from '@/domain/category/category-id'
import { parseShopIds } from '@/domain/shared/shop-id'
import {
  ShoppingListItemNotFoundError,
  ShoppingListNotFoundError,
} from '@/domain/shopping-list/errors'
import {
  ChangeNameError,
  ChangeQuantityError,
} from '@/domain/shopping-list/shopping-list-item'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { err, ok, Result, unitTypes } from '@glist/shared'
import z from 'zod'
import { RequestContext } from '../shared/request-context'

export const ReplaceShoppingListItemCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim().nullable(),
  categoryId: z.uuid().nullable(),
  quantity: z.number().positive().nullable(),
  quantityUnit: z.enum(unitTypes).nullable(),
  shopIds: z.array(z.uuid()),
})

export type ReplaceShoppingListItemCommand = z.infer<
  typeof ReplaceShoppingListItemCommandSchema
>

export type ReplaceShoppingListItemError =
  | ShoppingListNotFoundError
  | ShoppingListItemNotFoundError
  | ChangeNameError
  | ChangeQuantityError

export class ReplaceShoppingListItemCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    shoppingListId: string,
    itemId: string,
    command: ReplaceShoppingListItemCommand,
    context: RequestContext,
  ): Promise<Result<void, ReplaceShoppingListItemError>> {
    const { householdId } = context

    const shoppingList = await this.repository.findById(shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({ type: 'SHOPPING_LIST_NOT_FOUND', id: shoppingListId })
    }

    const item = shoppingList.findItem(itemId)

    if (!item) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: itemId })
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

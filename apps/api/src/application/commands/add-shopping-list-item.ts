import { parseCategoryId } from '@/domain/category/category-id'
import { parseShopIds } from '@/domain/shop/shop-id'
import { CreateShoppingListItemError } from '@/domain/shopping-list/shopping-list-item'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { err, ok, Result } from '@glist/shared'
import { RequestContext } from '../shared/request-context'

export type AddShoppingListItemCommand = {
  shoppingListId: string
  name: string
  description?: string
  categoryId?: string
  quantity?: number
  quantityUnit?: string
  shopIds?: string[]
}

export type AddShoppingListItemError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | CreateShoppingListItemError

export class AddShoppingListItemCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    command: AddShoppingListItemCommand,
    context: RequestContext,
  ): Promise<Result<string, AddShoppingListItemError>> {
    const { householdId } = context

    const shoppingList = await this.repository.findById(command.shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({
        type: 'SHOPPING_LIST_NOT_FOUND',
        id: command.shoppingListId,
      })
    }

    const result = shoppingList.addItem({
      name: command.name,
      description: command.description,
      categoryId: command.categoryId
        ? parseCategoryId(command.categoryId)
        : undefined,
      quantity: command.quantity,
      quantityUnit: command.quantityUnit,
      shopIds: command.shopIds ? parseShopIds(command.shopIds) : undefined,
    })

    if (!result.ok) {
      return err(result.error)
    }

    await this.repository.save(shoppingList)

    return ok(result.value.id)
  }
}

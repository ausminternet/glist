import { parseCategoryId } from '@/domain/shared/category-id';
import { parseShopIds } from '@/domain/shared/shop-id';
import { CreateShoppingListItemError } from '@/domain/shopping-list/shopping-list-item';
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository';
import { err, ok, Result, unitTypes } from '@glist/shared';
import z from 'zod';
import { RequestContext } from '../shared/request-context';

export const AddShoppingListItemCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim().optional(),
  categoryId: z.uuid().optional(),
  quantity: z.number().positive().optional(),
  quantityUnit: z.enum(unitTypes).optional(),
  shopIds: z.array(z.uuid()).optional(),
})

export type AddShoppingListItemCommand = z.infer<
  typeof AddShoppingListItemCommandSchema
>

export type AddShoppingListItemError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | CreateShoppingListItemError

export class AddShoppingListItemCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    shoppingListId: string,
    command: AddShoppingListItemCommand,
    context: RequestContext,
  ): Promise<Result<string, AddShoppingListItemError>> {
    const { householdId } = context

    const shoppingList = await this.repository.findById(shoppingListId)

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({ type: 'SHOPPING_LIST_NOT_FOUND', id: shoppingListId })
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

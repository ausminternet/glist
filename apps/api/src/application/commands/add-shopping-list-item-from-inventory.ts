import { parseInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { err, ok, Result } from '@glist/shared'
import { RequestContext } from '../shared/request-context'

export type AddShoppingListItemFromInventoryCommand = {
  inventoryItemId: string
  shoppingListId: string
}

export type AddShoppingListItemFromInventoryError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | { type: 'INVENTORY_ITEM_NOT_FOUND'; id: string }

export class AddShoppingListItemFromInventoryCommandHandler {
  constructor(
    private shoppingListRepository: ShoppingListRepository,
    private inventoryItemRepository: InventoryItemRepository,
  ) {}

  async execute(
    command: AddShoppingListItemFromInventoryCommand,
    context: RequestContext,
  ): Promise<Result<string, AddShoppingListItemFromInventoryError>> {
    const { householdId } = context

    const shoppingList = await this.shoppingListRepository.findById(
      command.shoppingListId,
    )

    if (!shoppingList || shoppingList.householdId !== householdId) {
      return err({
        type: 'SHOPPING_LIST_NOT_FOUND',
        id: command.shoppingListId,
      })
    }

    const inventoryItem = await this.inventoryItemRepository.findById(
      command.inventoryItemId,
    )

    if (!inventoryItem || inventoryItem.householdId !== householdId) {
      return err({
        type: 'INVENTORY_ITEM_NOT_FOUND',
        id: command.inventoryItemId,
      })
    }

    const shoppingListItem = shoppingList.addItemFromInventory({
      inventoryItemId: parseInventoryItemId(inventoryItem.id),
      name: inventoryItem.name,
      description: inventoryItem.description,
      categoryId: inventoryItem.categoryId,
      shopIds: inventoryItem.shopIds,
    })

    await this.shoppingListRepository.save(shoppingList)

    return ok(shoppingListItem.id)
  }
}

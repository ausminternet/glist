import { err, okWithEvent, type Result } from '@glist/shared'
import { parseInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import type { ItemAddedEvent } from '@/domain/shopping-list-item/events'
import { ShoppingListItem } from '@/domain/shopping-list-item/shopping-list-item'
import { generateShoppingListItemId } from '@/domain/shopping-list-item/shopping-list-item-id'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { RequestContext } from '../shared/request-context'

export type AddShoppingListItemFromInventoryCommand = {
  inventoryItemId: string
}

export type AddShoppingListItemFromInventoryError =
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | { type: 'INVENTORY_ITEM_NOT_FOUND'; id: string }

type AddShoppingListItemFromInventoryResult = Result<
  { value: string; event: ItemAddedEvent },
  AddShoppingListItemFromInventoryError
>

export class AddShoppingListItemFromInventoryCommandHandler {
  constructor(
    private shoppingListItemRepository: ShoppingListItemRepository,
    private inventoryItemRepository: InventoryItemRepository,
  ) {}

  async execute(
    command: AddShoppingListItemFromInventoryCommand,
    context: RequestContext,
  ): Promise<AddShoppingListItemFromInventoryResult> {
    const inventoryItem = await this.inventoryItemRepository.findById(
      command.inventoryItemId,
    )

    if (!inventoryItem) {
      return err({
        type: 'INVENTORY_ITEM_NOT_FOUND',
        id: command.inventoryItemId,
      })
    }

    const shoppingListItem = ShoppingListItem.createFromInventoryItem(
      generateShoppingListItemId(),
      {
        inventoryItemId: parseInventoryItemId(inventoryItem.id),
        householdId: context.householdId,
        name: inventoryItem.name,
        description: inventoryItem.description,
        categoryId: inventoryItem.categoryId,
        shopIds: inventoryItem.shopIds,
      },
    )

    await this.shoppingListItemRepository.save(shoppingListItem)

    return okWithEvent(shoppingListItem.id, {
      type: 'item-added',
      householdId: context.householdId,
      itemId: shoppingListItem.id,
    })
  }
}

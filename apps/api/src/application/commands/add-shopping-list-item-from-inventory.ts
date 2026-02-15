import { err, okWithEvent, type Result } from '@glist/shared'
import { parseInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import type { ItemAddedEvent } from '@/domain/shopping-list/events'
import { parseShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import { ShoppingListItem } from '@/domain/shopping-list-item/shopping-list-item'
import { generateShoppingListItemId } from '@/domain/shopping-list-item/shopping-list-item-id'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'

export type AddShoppingListItemFromInventoryCommand = {
  inventoryItemId: string
  shoppingListId: string
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
      parseShoppingListId(command.shoppingListId),
      {
        inventoryItemId: parseInventoryItemId(inventoryItem.id),
        name: inventoryItem.name,
        description: inventoryItem.description,
        categoryId: inventoryItem.categoryId,
        shopIds: inventoryItem.shopIds,
      },
    )

    await this.shoppingListItemRepository.save(shoppingListItem)

    return okWithEvent(shoppingListItem.id, {
      type: 'item-added',
      listId: command.shoppingListId,
      itemId: shoppingListItem.id,
    })
  }
}

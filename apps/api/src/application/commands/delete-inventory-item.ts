import { err, ok, type Result } from '@glist/shared'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'

export type DeleteInventoryItemError = {
  type: 'INVENTORY_ITEM_NOT_FOUND'
  id: string
}

export type DeleteInventoryItemCommand = {
  inventoryItemId: string
}

export class DeleteInventoryItemCommandHandler {
  constructor(private repository: InventoryItemRepository) {}

  async execute(
    command: DeleteInventoryItemCommand,
  ): Promise<Result<void, DeleteInventoryItemError>> {
    const inventoryItem = await this.repository.findById(
      command.inventoryItemId,
    )

    if (!inventoryItem) {
      return err({
        type: 'INVENTORY_ITEM_NOT_FOUND',
        id: command.inventoryItemId,
      })
    }

    await this.repository.delete(command.inventoryItemId)

    return ok(undefined)
  }
}

import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import type { RequestContext } from '../shared/request-context'

type DeleteInventoryItemCommand = {
  inventoryItemId: string
}

export class DeleteInventoryItemCommandHandler {
  constructor(private inventoryItemRepository: InventoryItemRepository) {}

  async execute(
    command: DeleteInventoryItemCommand,
    context: RequestContext,
  ): Promise<void> {
    const item = await this.inventoryItemRepository.findById(
      command.inventoryItemId,
    )

    if (!item || item.householdId !== context.householdId) {
      return // Idempotent: not found = ok
    }

    await this.inventoryItemRepository.delete(command.inventoryItemId)

    return
  }
}

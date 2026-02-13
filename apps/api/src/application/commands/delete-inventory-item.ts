import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository';
import { err, ok, Result } from '@glist/shared';
import { RequestContext } from '../shared/request-context';

export type DeleteInventoryItemError =
  | { type: 'INVENTORY_ITEM_NOT_FOUND'; id: string }

export class DeleteInventoryItemCommandHandler {
  constructor(private repository: InventoryItemRepository) {}

  async execute(
    inventoryItemId: string,
    context: RequestContext,
  ): Promise<Result<void, DeleteInventoryItemError>> {
    const { householdId } = context

    const inventoryItem = await this.repository.findById(inventoryItemId)

    if (!inventoryItem || inventoryItem.householdId !== householdId) {
      return err({ type: 'INVENTORY_ITEM_NOT_FOUND', id: inventoryItemId })
    }

    await this.repository.delete(inventoryItemId)

    return ok(undefined)
  }
}

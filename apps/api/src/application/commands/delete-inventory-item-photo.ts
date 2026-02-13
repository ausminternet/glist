import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import { err, ok, Result } from '@glist/shared'
import { RequestContext } from '../shared/request-context'

export type DeleteInventoryItemPhotoError =
  | { type: 'INVENTORY_ITEM_NOT_FOUND'; id: string }
  | { type: 'NO_PHOTO_EXISTS' }

export class DeleteInventoryItemPhotoCommandHandler {
  constructor(
    private repository: InventoryItemRepository,
    private photoStorage: PhotoStorage,
  ) {}

  async execute(
    inventoryItemId: string,
    context: RequestContext,
  ): Promise<Result<void, DeleteInventoryItemPhotoError>> {
    const { householdId } = context

    const item = await this.repository.findById(inventoryItemId)

    if (!item || item.householdId !== householdId) {
      return err({ type: 'INVENTORY_ITEM_NOT_FOUND', id: inventoryItemId })
    }

    if (!item.photoKey) {
      return err({ type: 'NO_PHOTO_EXISTS' })
    }

    await this.photoStorage.delete(item.photoKey)

    item.setPhotoKey(null)
    await this.repository.save(item)

    return ok(undefined)
  }
}

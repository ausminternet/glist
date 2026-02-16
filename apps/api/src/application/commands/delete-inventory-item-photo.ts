import { err, ok, type Result } from '@glist/shared'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import type { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import type { RequestContext } from '../shared/request-context'

export type DeleteInventoryItemPhotoError =
  | { type: 'INVENTORY_ITEM_NOT_FOUND'; id: string }
  | { type: 'NO_PHOTO_EXISTS' }

type DeleteInventoryItemPhotoCommand = {
  inventoryItemId: string
}

export class DeleteInventoryItemPhotoCommandHandler {
  constructor(
    private repository: InventoryItemRepository,
    private photoStorage: PhotoStorage,
  ) {}

  async execute(
    command: DeleteInventoryItemPhotoCommand,
    context: RequestContext,
  ): Promise<Result<void, DeleteInventoryItemPhotoError>> {
    const item = await this.repository.findById(command.inventoryItemId)

    if (!item || item.householdId !== context.householdId) {
      return err({
        type: 'INVENTORY_ITEM_NOT_FOUND',
        id: command.inventoryItemId,
      })
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

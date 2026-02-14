import { err, ok, type Result } from '@glist/shared'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import {
  generatePhotoKey,
  type PhotoStorage,
} from '@/infrastructure/storage/photo-storage'
import type { RequestContext } from '../shared/request-context'

export type UploadInventoryItemPhotoError =
  | { type: 'INVENTORY_ITEM_NOT_FOUND'; id: string }
  | { type: 'INVALID_CONTENT_TYPE'; contentType: string }

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export class UploadInventoryItemPhotoCommandHandler {
  constructor(
    private repository: InventoryItemRepository,
    private photoStorage: PhotoStorage,
  ) {}

  async execute(
    inventoryItemId: string,
    photoData: ArrayBuffer,
    contentType: string,
    context: RequestContext,
  ): Promise<Result<string, UploadInventoryItemPhotoError>> {
    const { householdId } = context

    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return err({ type: 'INVALID_CONTENT_TYPE', contentType })
    }

    const item = await this.repository.findById(inventoryItemId)

    if (!item || item.householdId !== householdId) {
      return err({ type: 'INVENTORY_ITEM_NOT_FOUND', id: inventoryItemId })
    }

    // Delete old photo if exists
    if (item.photoKey) {
      await this.photoStorage.delete(item.photoKey)
    }

    // Upload new photo
    const photoKey = generatePhotoKey('inventory-item', inventoryItemId)
    await this.photoStorage.upload(photoKey, photoData, contentType)

    // Update item with new photo key
    item.setPhotoKey(photoKey)
    await this.repository.save(item)

    const photoUrl = this.photoStorage.getPublicUrl(photoKey)

    return ok(photoUrl)
  }
}

import { beforeEach, describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import type { InventoryItem } from '@/domain/inventory-item/inventory-item'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import type { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import {
  createMockInventoryItemRepository,
  createMockPhotoStorage,
  createTestInventoryItem,
} from '@/test'
import { DeleteInventoryItemPhotoCommandHandler } from './delete-inventory-item-photo'

const householdId = generateHouseholdId()
const photoKey = 'inventory-item/test-id/12345.jpg'

describe('DeleteInventoryItemPhotoCommandHandler', () => {
  let item: InventoryItem
  let repository: InventoryItemRepository
  let photoStorage: PhotoStorage
  let handler: DeleteInventoryItemPhotoCommandHandler

  beforeEach(() => {
    item = createTestInventoryItem({ householdId, photoKey })
    repository = createMockInventoryItemRepository([item])
    photoStorage = createMockPhotoStorage()
    handler = new DeleteInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )
  })

  test('deletes photo successfully', async () => {
    const result = await handler.execute(
      { inventoryItemId: item.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(photoStorage.delete).toHaveBeenCalledWith(photoKey)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.photoKey).toBeNull()
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    const result = await handler.execute(
      { inventoryItemId: 'non-existent-id' },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVENTORY_ITEM_NOT_FOUND')
    expect(photoStorage.delete).not.toHaveBeenCalled()
  })

  test('returns NO_PHOTO_EXISTS when item has no photo', async () => {
    item = createTestInventoryItem({ householdId })
    repository = createMockInventoryItemRepository([item])
    handler = new DeleteInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      { inventoryItemId: item.id },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('NO_PHOTO_EXISTS')
    expect(photoStorage.delete).not.toHaveBeenCalled()
  })
})

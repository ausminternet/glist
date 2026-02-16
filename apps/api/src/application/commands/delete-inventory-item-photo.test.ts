import { describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import {
  createMockInventoryItemRepository,
  createMockPhotoStorage,
  createTestInventoryItem,
} from '@/test'
import { DeleteInventoryItemPhotoCommandHandler } from './delete-inventory-item-photo'

const householdId = generateHouseholdId()

describe('DeleteInventoryItemPhotoCommandHandler', () => {
  const photoKey = 'inventory-item/test-id/12345.jpg'

  test('deletes photo successfully', async () => {
    const item = createTestInventoryItem({ householdId, photoKey })
    const repository = createMockInventoryItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      { inventoryItemId: item.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(photoStorage.delete).toHaveBeenCalledTimes(1)
    expect(photoStorage.delete).toHaveBeenCalledWith(photoKey)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.photoKey).toBeNull()
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    const repository = createMockInventoryItemRepository()
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      { inventoryItemId: 'non-existent-id' },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVENTORY_ITEM_NOT_FOUND')
    if (result.error.type === 'INVENTORY_ITEM_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-id')
    }
    expect(photoStorage.delete).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns NO_PHOTO_EXISTS when item has no photo', async () => {
    const item = createTestInventoryItem({ householdId })
    const repository = createMockInventoryItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteInventoryItemPhotoCommandHandler(
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
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('updates item updatedAt timestamp after deletion', async () => {
    const item = createTestInventoryItem({ householdId, photoKey })
    const repository = createMockInventoryItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const originalUpdatedAt = item.updatedAt

    const result = await handler.execute(
      { inventoryItemId: item.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(item.updatedAt).not.toBe(originalUpdatedAt)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})

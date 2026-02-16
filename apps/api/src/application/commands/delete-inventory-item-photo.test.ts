import { describe, expect, mock, test } from 'bun:test'
import { parseHouseholdId } from '@/domain/household/household-id'
import { InventoryItem } from '@/domain/inventory-item/inventory-item'
import { generateInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import type { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import { DeleteInventoryItemPhotoCommandHandler } from './delete-inventory-item-photo'

function createTestInventoryItem(householdId: string, photoKey?: string) {
  const result = InventoryItem.create(
    generateInventoryItemId(),
    parseHouseholdId(householdId),
    {
      name: 'Test Item',
      targetStock: 1,
    },
  )
  if (!result.ok) throw new Error('Failed to create test item')
  if (photoKey) {
    result.value.setPhotoKey(photoKey)
  }
  return result.value
}

function createMockRepository(
  item: InventoryItem | null,
): InventoryItemRepository {
  return {
    findById: mock(() => Promise.resolve(item)),
    findAllByHouseholdId: mock(() => Promise.resolve([])),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
  }
}

function createMockPhotoStorage(): PhotoStorage {
  return {
    upload: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    getPublicUrl: mock((key: string) => `https://photos.test.com/${key}`),
  }
}

describe('DeleteInventoryItemPhotoCommandHandler', () => {
  const householdId = '00000000-0000-0000-0000-000000000001'
  const photoKey = 'inventory-item/test-id/12345.jpg'

  test('deletes photo successfully', async () => {
    const item = createTestInventoryItem(householdId, photoKey)
    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({ inventoryItemId: item.id })

    expect(result.ok).toBe(true)
    expect(photoStorage.delete).toHaveBeenCalledTimes(1)
    expect(photoStorage.delete).toHaveBeenCalledWith(photoKey)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.photoKey).toBeNull()
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    const repository = createMockRepository(null)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({ inventoryItemId: 'non-existent-id' })

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
    const item = createTestInventoryItem(householdId) // No photoKey
    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({ inventoryItemId: item.id })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('NO_PHOTO_EXISTS')
    expect(photoStorage.delete).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('updates item updatedAt timestamp after deletion', async () => {
    const item = createTestInventoryItem(householdId, photoKey)
    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const originalUpdatedAt = item.updatedAt

    const result = await handler.execute({ inventoryItemId: item.id })

    expect(result.ok).toBe(true)
    expect(item.updatedAt).not.toBe(originalUpdatedAt)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})

import { InventoryItem } from '@/domain/inventory-item/inventory-item'
import { generateInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { parseHouseholdId } from '@/domain/shared/household-id'
import { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import { describe, expect, mock, test } from 'bun:test'
import { UploadInventoryItemPhotoCommandHandler } from './upload-inventory-item-photo'

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

describe('UploadInventoryItemPhotoCommandHandler', () => {
  const householdId = '00000000-0000-0000-0000-000000000001'
  const photoData = new ArrayBuffer(100)
  const contentType = 'image/jpeg'

  test('uploads photo successfully', async () => {
    const item = createTestInventoryItem(householdId)
    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(item.id, photoData, contentType, {
      householdId,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toContain('https://photos.test.com/')
    expect(photoStorage.upload).toHaveBeenCalledTimes(1)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.photoKey).not.toBeNull()
  })

  test('deletes old photo before uploading new one', async () => {
    const oldPhotoKey = 'inventory-item/old-id/12345.jpg'
    const item = createTestInventoryItem(householdId, oldPhotoKey)
    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(item.id, photoData, contentType, {
      householdId,
    })

    expect(result.ok).toBe(true)
    expect(photoStorage.delete).toHaveBeenCalledTimes(1)
    expect(photoStorage.delete).toHaveBeenCalledWith(oldPhotoKey)
    expect(photoStorage.upload).toHaveBeenCalledTimes(1)
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    const repository = createMockRepository(null)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      'non-existent-id',
      photoData,
      contentType,
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVENTORY_ITEM_NOT_FOUND')
    if (result.error.type === 'INVENTORY_ITEM_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-id')
    }
    expect(photoStorage.upload).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item belongs to different household', async () => {
    const item = createTestInventoryItem('00000000-0000-0000-0000-000000000002')
    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(item.id, photoData, contentType, {
      householdId,
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVENTORY_ITEM_NOT_FOUND')
    expect(photoStorage.upload).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns INVALID_CONTENT_TYPE for unsupported content type', async () => {
    const item = createTestInventoryItem(householdId)
    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(item.id, photoData, 'image/gif', {
      householdId,
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVALID_CONTENT_TYPE')
    if (result.error.type === 'INVALID_CONTENT_TYPE') {
      expect(result.error.contentType).toBe('image/gif')
    }
    expect(photoStorage.upload).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('accepts image/jpeg content type', async () => {
    const item = createTestInventoryItem(householdId)
    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(item.id, photoData, 'image/jpeg', {
      householdId,
    })

    expect(result.ok).toBe(true)
  })

  test('accepts image/png content type', async () => {
    const item = createTestInventoryItem(householdId)
    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(item.id, photoData, 'image/png', {
      householdId,
    })

    expect(result.ok).toBe(true)
  })

  test('accepts image/webp content type', async () => {
    const item = createTestInventoryItem(householdId)
    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(item.id, photoData, 'image/webp', {
      householdId,
    })

    expect(result.ok).toBe(true)
  })

  test('updates item updatedAt timestamp', async () => {
    const item = createTestInventoryItem(householdId)
    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const originalUpdatedAt = item.updatedAt

    const result = await handler.execute(item.id, photoData, contentType, {
      householdId,
    })

    expect(result.ok).toBe(true)
    expect(item.updatedAt).not.toBe(originalUpdatedAt)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})

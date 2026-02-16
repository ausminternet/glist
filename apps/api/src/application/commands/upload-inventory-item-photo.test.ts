import { describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import {
  createMockInventoryItemRepository,
  createMockPhotoStorage,
  createTestInventoryItem,
} from '@/test'
import { UploadInventoryItemPhotoCommandHandler } from './upload-inventory-item-photo'

const householdId = generateHouseholdId()

describe('UploadInventoryItemPhotoCommandHandler', () => {
  const photoData = new ArrayBuffer(100)
  const contentType = 'image/jpeg'

  test('uploads photo successfully', async () => {
    const item = createTestInventoryItem({ householdId })
    const repository = createMockInventoryItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        inventoryItemId: item.id,
        photoData,
        contentType,
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toContain('https://example.com/')
    expect(photoStorage.upload).toHaveBeenCalledTimes(1)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.photoKey).not.toBeNull()
  })

  test('deletes old photo before uploading new one', async () => {
    const oldPhotoKey = 'inventory-item/old-id/12345.jpg'
    const item = createTestInventoryItem({ householdId, photoKey: oldPhotoKey })
    const repository = createMockInventoryItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        inventoryItemId: item.id,
        photoData,
        contentType,
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(photoStorage.delete).toHaveBeenCalledTimes(1)
    expect(photoStorage.delete).toHaveBeenCalledWith(oldPhotoKey)
    expect(photoStorage.upload).toHaveBeenCalledTimes(1)
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    const repository = createMockInventoryItemRepository()
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        inventoryItemId: 'non-existent-id',
        photoData,
        contentType,
      },
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

  test('returns INVALID_CONTENT_TYPE for unsupported content type', async () => {
    const item = createTestInventoryItem({ householdId })
    const repository = createMockInventoryItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        inventoryItemId: item.id,
        photoData,
        contentType: 'image/gif',
      },
      { householdId },
    )

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
    const item = createTestInventoryItem({ householdId })
    const repository = createMockInventoryItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        inventoryItemId: item.id,
        photoData,
        contentType: 'image/jpeg',
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
  })

  test('accepts image/png content type', async () => {
    const item = createTestInventoryItem({ householdId })
    const repository = createMockInventoryItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        inventoryItemId: item.id,
        photoData,
        contentType: 'image/png',
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
  })

  test('accepts image/webp content type', async () => {
    const item = createTestInventoryItem({ householdId })
    const repository = createMockInventoryItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        inventoryItemId: item.id,
        photoData,
        contentType: 'image/webp',
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
  })

  test('updates item updatedAt timestamp', async () => {
    const item = createTestInventoryItem({ householdId })
    const repository = createMockInventoryItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const originalUpdatedAt = item.updatedAt

    const result = await handler.execute(
      {
        inventoryItemId: item.id,
        photoData,
        contentType: 'image/webp',
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(item.updatedAt).not.toBe(originalUpdatedAt)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})

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
import { UploadInventoryItemPhotoCommandHandler } from './upload-inventory-item-photo'

const householdId = generateHouseholdId()
const photoData = new ArrayBuffer(100)

describe('UploadInventoryItemPhotoCommandHandler', () => {
  let item: InventoryItem
  let repository: InventoryItemRepository
  let photoStorage: PhotoStorage
  let handler: UploadInventoryItemPhotoCommandHandler

  beforeEach(() => {
    item = createTestInventoryItem({ householdId })
    repository = createMockInventoryItemRepository([item])
    photoStorage = createMockPhotoStorage()
    handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )
  })

  test('uploads photo successfully', async () => {
    const result = await handler.execute(
      { inventoryItemId: item.id, photoData, contentType: 'image/jpeg' },
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
    item = createTestInventoryItem({ householdId, photoKey: oldPhotoKey })
    repository = createMockInventoryItemRepository([item])
    handler = new UploadInventoryItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      { inventoryItemId: item.id, photoData, contentType: 'image/jpeg' },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(photoStorage.delete).toHaveBeenCalledWith(oldPhotoKey)
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    const result = await handler.execute(
      {
        inventoryItemId: 'non-existent-id',
        photoData,
        contentType: 'image/jpeg',
      },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVENTORY_ITEM_NOT_FOUND')
    expect(photoStorage.upload).not.toHaveBeenCalled()
  })

  test('returns INVALID_CONTENT_TYPE for unsupported content type', async () => {
    const result = await handler.execute(
      { inventoryItemId: item.id, photoData, contentType: 'image/gif' },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVALID_CONTENT_TYPE')
    expect(photoStorage.upload).not.toHaveBeenCalled()
  })

  test.each([
    'image/jpeg',
    'image/png',
    'image/webp',
  ])('accepts %s content type', async (contentType) => {
    const result = await handler.execute(
      { inventoryItemId: item.id, photoData, contentType },
      { householdId },
    )

    expect(result.ok).toBe(true)
  })
})

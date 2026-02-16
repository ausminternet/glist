import { beforeEach, describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import type { ShoppingListItem } from '@/domain/shopping-list-item/shopping-list-item'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import {
  createMockPhotoStorage,
  createMockShoppingListItemRepository,
  createTestShoppingListItem,
} from '@/test'
import { UploadShoppingListItemPhotoCommandHandler } from './upload-shopping-list-item-photo'

const householdId = generateHouseholdId()
const photoData = new ArrayBuffer(100)

describe('UploadShoppingListItemPhotoCommandHandler', () => {
  let item: ShoppingListItem
  let repository: ShoppingListItemRepository
  let photoStorage: PhotoStorage
  let handler: UploadShoppingListItemPhotoCommandHandler

  beforeEach(() => {
    item = createTestShoppingListItem({ householdId })
    repository = createMockShoppingListItemRepository([item])
    photoStorage = createMockPhotoStorage()
    handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )
  })

  test('uploads photo successfully', async () => {
    const result = await handler.execute(
      { itemId: item.id, photoData, contentType: 'image/jpeg' },
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
    const oldPhotoKey = 'shopping-list-item/old-id/12345.jpg'
    item = createTestShoppingListItem({ householdId, photoKey: oldPhotoKey })
    repository = createMockShoppingListItemRepository([item])
    handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      { itemId: item.id, photoData, contentType: 'image/jpeg' },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(photoStorage.delete).toHaveBeenCalledWith(oldPhotoKey)
  })

  test('returns SHOPPING_LIST_ITEM_NOT_FOUND when item does not exist', async () => {
    const result = await handler.execute(
      { itemId: 'non-existent-id', photoData, contentType: 'image/jpeg' },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_ITEM_NOT_FOUND')
    expect(photoStorage.upload).not.toHaveBeenCalled()
  })

  test('returns INVALID_CONTENT_TYPE for unsupported content type', async () => {
    const result = await handler.execute(
      { itemId: item.id, photoData, contentType: 'image/gif' },
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
      { itemId: item.id, photoData, contentType },
      { householdId },
    )

    expect(result.ok).toBe(true)
  })
})

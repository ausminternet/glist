import { describe, expect, test } from 'bun:test'
import {
  createMockPhotoStorage,
  createMockShoppingListItemRepository,
  createTestShoppingListItem,
} from '@/test'
import { UploadShoppingListItemPhotoCommandHandler } from './upload-shopping-list-item-photo'

describe('UploadShoppingListItemPhotoCommandHandler', () => {
  const photoData = new ArrayBuffer(100)
  const contentType = 'image/jpeg'

  test('uploads photo successfully', async () => {
    const item = createTestShoppingListItem()
    const repository = createMockShoppingListItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({
      itemId: item.id,
      photoData,
      contentType,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toContain('https://example.com/')
    expect(photoStorage.upload).toHaveBeenCalledTimes(1)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.photoKey).not.toBeNull()
  })

  test('deletes old photo before uploading new one', async () => {
    const oldPhotoKey = 'shopping-list-item/old-id/12345.jpg'
    const item = createTestShoppingListItem({ photoKey: oldPhotoKey })
    const repository = createMockShoppingListItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({
      itemId: item.id,
      photoData,
      contentType,
    })

    expect(result.ok).toBe(true)
    expect(photoStorage.delete).toHaveBeenCalledTimes(1)
    expect(photoStorage.delete).toHaveBeenCalledWith(oldPhotoKey)
    expect(photoStorage.upload).toHaveBeenCalledTimes(1)
  })

  test('returns SHOPPING_LIST_ITEM_NOT_FOUND when item does not exist', async () => {
    const repository = createMockShoppingListItemRepository()
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({
      itemId: 'non-existent-item',
      photoData,
      contentType,
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_ITEM_NOT_FOUND')
    if (result.error.type === 'SHOPPING_LIST_ITEM_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-item')
    }
    expect(photoStorage.upload).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns INVALID_CONTENT_TYPE for unsupported content type', async () => {
    const item = createTestShoppingListItem()
    const repository = createMockShoppingListItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({
      itemId: item.id,
      photoData,
      contentType: 'image/gif',
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
    const item = createTestShoppingListItem()
    const repository = createMockShoppingListItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({
      itemId: item.id,
      photoData,
      contentType: 'image/jpeg',
    })

    expect(result.ok).toBe(true)
  })

  test('accepts image/png content type', async () => {
    const item = createTestShoppingListItem()
    const repository = createMockShoppingListItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({
      itemId: item.id,
      photoData,
      contentType: 'image/png',
    })

    expect(result.ok).toBe(true)
  })

  test('accepts image/webp content type', async () => {
    const item = createTestShoppingListItem()
    const repository = createMockShoppingListItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({
      itemId: item.id,
      photoData,
      contentType: 'image/webp',
    })

    expect(result.ok).toBe(true)
  })

  test('updates item updatedAt timestamp', async () => {
    const item = createTestShoppingListItem()
    const originalUpdatedAt = item.updatedAt
    const repository = createMockShoppingListItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({
      itemId: item.id,
      photoData,
      contentType,
    })

    expect(result.ok).toBe(true)
    expect(item.updatedAt).not.toBe(originalUpdatedAt)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})

import { describe, expect, mock, test } from 'bun:test'
import { Quantity } from '@/domain/shared/quantity'
import { parseShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import {
  ShoppingListItem,
  type ShoppingListItemProps,
} from '@/domain/shopping-list-item/shopping-list-item'
import { generateShoppingListItemId } from '@/domain/shopping-list-item/shopping-list-item-id'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import { UploadShoppingListItemPhotoCommandHandler } from './upload-shopping-list-item-photo'

function createTestShoppingListItem(
  shoppingListId: string,
  options?: { name?: string; photoKey?: string | null },
) {
  const quantityResult = Quantity.create(null, null)
  if (!quantityResult.ok) throw new Error('Failed to create quantity')

  const props: ShoppingListItemProps = {
    id: generateShoppingListItemId(),
    shoppingListId: parseShoppingListId(shoppingListId),
    inventoryItemId: null,
    name: options?.name ?? 'Test Item',
    description: null,
    categoryId: null,
    quantity: quantityResult.value,
    checked: false,
    shopIds: [],
    photoKey: options?.photoKey ?? null,
    createdAt: new Date(),
    updatedAt: null,
  }

  return new ShoppingListItem(props)
}

function createMockRepository(
  item: ShoppingListItem | null,
): ShoppingListItemRepository {
  return {
    findById: mock(() => Promise.resolve(item)),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    deleteCheckedByShoppingListId: mock(() => Promise.resolve()),
  }
}

function createMockPhotoStorage(): PhotoStorage {
  return {
    upload: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    getPublicUrl: mock((key: string) => `https://photos.test.com/${key}`),
  }
}

describe('UploadShoppingListItemPhotoCommandHandler', () => {
  const shoppingListId = '00000000-0000-0000-0000-000000000010'
  const photoData = new ArrayBuffer(100)
  const contentType = 'image/jpeg'

  test('uploads photo successfully', async () => {
    const item = createTestShoppingListItem(shoppingListId)

    const repository = createMockRepository(item)
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
    expect(result.value).toContain('https://photos.test.com/')
    expect(photoStorage.upload).toHaveBeenCalledTimes(1)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.photoKey).not.toBeNull()
  })

  test('deletes old photo before uploading new one', async () => {
    const oldPhotoKey = 'shopping-list-item/old-id/12345.jpg'
    const item = createTestShoppingListItem(shoppingListId, {
      photoKey: oldPhotoKey,
    })

    const repository = createMockRepository(item)
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
    const repository = createMockRepository(null)
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
    const item = createTestShoppingListItem(shoppingListId)

    const repository = createMockRepository(item)
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
    const item = createTestShoppingListItem(shoppingListId)

    const repository = createMockRepository(item)
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
    const item = createTestShoppingListItem(shoppingListId)

    const repository = createMockRepository(item)
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
    const item = createTestShoppingListItem(shoppingListId)

    const repository = createMockRepository(item)
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
    const item = createTestShoppingListItem(shoppingListId)
    const originalUpdatedAt = item.updatedAt

    const repository = createMockRepository(item)
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

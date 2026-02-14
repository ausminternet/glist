import { describe, expect, mock, test } from 'bun:test'
import { parseHouseholdId } from '@/domain/shared/household-id'
import { ShoppingList } from '@/domain/shopping-list/shopping-list'
import { generateShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import { UploadShoppingListItemPhotoCommandHandler } from './upload-shopping-list-item-photo'

function createTestShoppingList(householdId: string) {
  const result = ShoppingList.create(
    generateShoppingListId(),
    parseHouseholdId(householdId),
    'Test Shopping List',
  )
  if (!result.ok) throw new Error('Failed to create test shopping list')
  return result.value
}

function createMockRepository(
  list: ShoppingList | null,
): ShoppingListRepository {
  return {
    findById: mock(() => Promise.resolve(list)),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    countByHouseholdId: mock(() => Promise.resolve(1)),
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
  const householdId = '00000000-0000-0000-0000-000000000001'
  const photoData = new ArrayBuffer(100)
  const contentType = 'image/jpeg'

  test('uploads photo successfully', async () => {
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({ name: 'Test Item' })
    const item = shoppingList.items[0]

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        shoppingListId: shoppingList.id,
        itemId: item.id,
        photoData,
        contentType,
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toContain('https://photos.test.com/')
    expect(photoStorage.upload).toHaveBeenCalledTimes(1)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.photoKey).not.toBeNull()
  })

  test('deletes old photo before uploading new one', async () => {
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({ name: 'Test Item' })
    const item = shoppingList.items[0]
    const oldPhotoKey = 'shopping-list-item/old-id/12345.jpg'
    item.setPhotoKey(oldPhotoKey)

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        shoppingListId: shoppingList.id,
        itemId: item.id,
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

  test('returns SHOPPING_LIST_NOT_FOUND when list does not exist', async () => {
    const repository = createMockRepository(null)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        shoppingListId: 'non-existent-list',
        itemId: 'some-item-id',
        photoData,
        contentType,
      },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_NOT_FOUND')
    if (result.error.type === 'SHOPPING_LIST_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-list')
    }
    expect(photoStorage.upload).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns SHOPPING_LIST_NOT_FOUND when list belongs to different household', async () => {
    const shoppingList = createTestShoppingList(
      '00000000-0000-0000-0000-000000000002',
    )
    shoppingList.addItem({ name: 'Test Item' })
    const item = shoppingList.items[0]

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        shoppingListId: shoppingList.id,
        itemId: item.id,
        photoData,
        contentType,
      },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_NOT_FOUND')
    expect(photoStorage.upload).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns SHOPPING_LIST_ITEM_NOT_FOUND when item does not exist', async () => {
    const shoppingList = createTestShoppingList(householdId)

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        shoppingListId: shoppingList.id,
        itemId: 'non-existent-item',
        photoData,
        contentType,
      },
      { householdId },
    )

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
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({ name: 'Test Item' })
    const item = shoppingList.items[0]

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        shoppingListId: shoppingList.id,
        itemId: item.id,
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
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({ name: 'Test Item' })
    const item = shoppingList.items[0]

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        shoppingListId: shoppingList.id,
        itemId: item.id,
        photoData,
        contentType: 'image/jpeg',
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
  })

  test('accepts image/png content type', async () => {
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({ name: 'Test Item' })
    const item = shoppingList.items[0]

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        shoppingListId: shoppingList.id,
        itemId: item.id,
        photoData,
        contentType: 'image/png',
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
  })

  test('accepts image/webp content type', async () => {
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({ name: 'Test Item' })
    const item = shoppingList.items[0]

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      {
        shoppingListId: shoppingList.id,
        itemId: item.id,
        photoData,
        contentType: 'image/webp',
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
  })

  test('updates item updatedAt timestamp', async () => {
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({ name: 'Test Item' })
    const item = shoppingList.items[0]

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new UploadShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const originalUpdatedAt = item.updatedAt

    const result = await handler.execute(
      {
        shoppingListId: shoppingList.id,
        itemId: item.id,
        photoData,
        contentType,
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(item.updatedAt).not.toBe(originalUpdatedAt)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})

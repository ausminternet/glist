import { parseHouseholdId } from '@/domain/shared/household-id'
import { ShoppingList } from '@/domain/shopping-list/shopping-list'
import { generateShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { PhotoStorage } from '@/infrastructure/storage/photo-storage'
import { describe, expect, mock, test } from 'bun:test'
import { DeleteShoppingListItemPhotoCommandHandler } from './delete-shopping-list-item-photo'

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

describe('DeleteShoppingListItemPhotoCommandHandler', () => {
  const householdId = '00000000-0000-0000-0000-000000000001'
  const photoKey = 'shopping-list-item/test-id/12345.jpg'

  test('deletes photo successfully', async () => {
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({ name: 'Test Item' })
    const item = shoppingList.items[0]
    item.setPhotoKey(photoKey)

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(shoppingList.id, item.id, {
      householdId,
    })

    expect(result.ok).toBe(true)
    expect(photoStorage.delete).toHaveBeenCalledTimes(1)
    expect(photoStorage.delete).toHaveBeenCalledWith(photoKey)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.photoKey).toBeNull()
  })

  test('returns SHOPPING_LIST_NOT_FOUND when list does not exist', async () => {
    const repository = createMockRepository(null)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      'non-existent-list',
      'some-item-id',
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_NOT_FOUND')
    if (result.error.type === 'SHOPPING_LIST_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-list')
    }
    expect(photoStorage.delete).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns SHOPPING_LIST_NOT_FOUND when list belongs to different household', async () => {
    const shoppingList = createTestShoppingList(
      '00000000-0000-0000-0000-000000000002',
    )
    shoppingList.addItem({ name: 'Test Item' })
    const item = shoppingList.items[0]
    item.setPhotoKey(photoKey)

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(shoppingList.id, item.id, {
      householdId,
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_NOT_FOUND')
    expect(photoStorage.delete).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns SHOPPING_LIST_ITEM_NOT_FOUND when item does not exist', async () => {
    const shoppingList = createTestShoppingList(householdId)

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      shoppingList.id,
      'non-existent-item',
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_ITEM_NOT_FOUND')
    if (result.error.type === 'SHOPPING_LIST_ITEM_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-item')
    }
    expect(photoStorage.delete).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns NO_PHOTO_EXISTS when item has no photo', async () => {
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({ name: 'Test Item' })
    const item = shoppingList.items[0]
    // No photoKey set

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(shoppingList.id, item.id, {
      householdId,
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('NO_PHOTO_EXISTS')
    expect(photoStorage.delete).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('updates item updatedAt timestamp after deletion', async () => {
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({ name: 'Test Item' })
    const item = shoppingList.items[0]
    item.setPhotoKey(photoKey)

    const repository = createMockRepository(shoppingList)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const originalUpdatedAt = item.updatedAt

    const result = await handler.execute(shoppingList.id, item.id, {
      householdId,
    })

    expect(result.ok).toBe(true)
    expect(item.updatedAt).not.toBe(originalUpdatedAt)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})

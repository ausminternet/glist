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
import { DeleteShoppingListItemPhotoCommandHandler } from './delete-shopping-list-item-photo'

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

describe('DeleteShoppingListItemPhotoCommandHandler', () => {
  const shoppingListId = '00000000-0000-0000-0000-000000000010'
  const photoKey = 'shopping-list-item/test-id/12345.jpg'

  test('deletes photo successfully', async () => {
    const item = createTestShoppingListItem(shoppingListId, { photoKey })

    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({ itemId: item.id })

    expect(result.ok).toBe(true)
    expect(photoStorage.delete).toHaveBeenCalledTimes(1)
    expect(photoStorage.delete).toHaveBeenCalledWith(photoKey)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.photoKey).toBeNull()
  })

  test('returns SHOPPING_LIST_ITEM_NOT_FOUND when item does not exist', async () => {
    const repository = createMockRepository(null)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({ itemId: 'non-existent-item' })

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
    const item = createTestShoppingListItem(shoppingListId)
    // No photoKey set

    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({ itemId: item.id })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('NO_PHOTO_EXISTS')
    expect(photoStorage.delete).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('updates item updatedAt timestamp after deletion', async () => {
    const item = createTestShoppingListItem(shoppingListId, { photoKey })
    const originalUpdatedAt = item.updatedAt

    const repository = createMockRepository(item)
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({ itemId: item.id })

    expect(result.ok).toBe(true)
    expect(item.updatedAt).not.toBe(originalUpdatedAt)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})

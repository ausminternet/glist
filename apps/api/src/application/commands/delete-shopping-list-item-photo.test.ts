import { describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import {
  createMockPhotoStorage,
  createMockShoppingListItemRepository,
  createTestShoppingListItem,
} from '@/test'
import { DeleteShoppingListItemPhotoCommandHandler } from './delete-shopping-list-item-photo'

const householdId = generateHouseholdId()

describe('DeleteShoppingListItemPhotoCommandHandler', () => {
  const photoKey = 'shopping-list-item/test-id/12345.jpg'

  test('deletes photo successfully', async () => {
    const item = createTestShoppingListItem({ householdId, photoKey })
    const repository = createMockShoppingListItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({ itemId: item.id }, { householdId })

    expect(result.ok).toBe(true)
    expect(photoStorage.delete).toHaveBeenCalledTimes(1)
    expect(photoStorage.delete).toHaveBeenCalledWith(photoKey)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.photoKey).toBeNull()
  })

  test('returns SHOPPING_LIST_ITEM_NOT_FOUND when item does not exist', async () => {
    const repository = createMockShoppingListItemRepository()
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute(
      { itemId: 'non-existent-item' },
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
    const item = createTestShoppingListItem({ householdId })
    const repository = createMockShoppingListItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({ itemId: item.id }, { householdId })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('NO_PHOTO_EXISTS')
    expect(photoStorage.delete).not.toHaveBeenCalled()
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('updates item updatedAt timestamp after deletion', async () => {
    const item = createTestShoppingListItem({ householdId, photoKey })
    const originalUpdatedAt = item.updatedAt
    const repository = createMockShoppingListItemRepository([item])
    const photoStorage = createMockPhotoStorage()
    const handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({ itemId: item.id }, { householdId })

    expect(result.ok).toBe(true)
    expect(item.updatedAt).not.toBe(originalUpdatedAt)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})

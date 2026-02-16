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
import { DeleteShoppingListItemPhotoCommandHandler } from './delete-shopping-list-item-photo'

const householdId = generateHouseholdId()
const photoKey = 'shopping-list-item/test-id/12345.jpg'

describe('DeleteShoppingListItemPhotoCommandHandler', () => {
  let item: ShoppingListItem
  let repository: ShoppingListItemRepository
  let photoStorage: PhotoStorage
  let handler: DeleteShoppingListItemPhotoCommandHandler

  beforeEach(() => {
    item = createTestShoppingListItem({ householdId, photoKey })
    repository = createMockShoppingListItemRepository([item])
    photoStorage = createMockPhotoStorage()
    handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )
  })

  test('deletes photo successfully', async () => {
    const result = await handler.execute({ itemId: item.id }, { householdId })

    expect(result.ok).toBe(true)
    expect(photoStorage.delete).toHaveBeenCalledWith(photoKey)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.photoKey).toBeNull()
  })

  test('returns SHOPPING_LIST_ITEM_NOT_FOUND when item does not exist', async () => {
    const result = await handler.execute(
      { itemId: 'non-existent-id' },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_ITEM_NOT_FOUND')
    expect(photoStorage.delete).not.toHaveBeenCalled()
  })

  test('returns NO_PHOTO_EXISTS when item has no photo', async () => {
    item = createTestShoppingListItem({ householdId })
    repository = createMockShoppingListItemRepository([item])
    handler = new DeleteShoppingListItemPhotoCommandHandler(
      repository,
      photoStorage,
    )

    const result = await handler.execute({ itemId: item.id }, { householdId })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('NO_PHOTO_EXISTS')
    expect(photoStorage.delete).not.toHaveBeenCalled()
  })
})

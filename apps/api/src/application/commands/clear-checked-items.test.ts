import { describe, expect, mock, test } from 'bun:test'
import { parseHouseholdId } from '@/domain/shared/household-id'
import { ShoppingList } from '@/domain/shopping-list/shopping-list'
import { generateShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import { ClearCheckedItemsCommandHandler } from './clear-checked-items'

function createTestShoppingList(householdId: string) {
  const result = ShoppingList.create(
    generateShoppingListId(),
    parseHouseholdId(householdId),
    'Test Shopping List',
  )
  if (!result.ok) throw new Error('Failed to create test shopping list')
  return result.value
}

function createMockShoppingListRepository(
  list: ShoppingList | null,
): ShoppingListRepository {
  return {
    findById: mock(() => Promise.resolve(list)),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    countByHouseholdId: mock(() => Promise.resolve(1)),
  }
}

function createMockShoppingListItemRepository(): ShoppingListItemRepository {
  return {
    findById: mock(() => Promise.resolve(null)),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    deleteCheckedByShoppingListId: mock(() => Promise.resolve()),
  }
}

describe('ClearCheckedItemsCommandHandler', () => {
  const householdId = '00000000-0000-0000-0000-000000000001'

  test('calls deleteCheckedByShoppingListId', async () => {
    const shoppingList = createTestShoppingList(householdId)
    const shoppingListRepository =
      createMockShoppingListRepository(shoppingList)
    const shoppingListItemRepository = createMockShoppingListItemRepository()
    const handler = new ClearCheckedItemsCommandHandler(
      shoppingListRepository,
      shoppingListItemRepository,
    )

    const result = await handler.execute({ shoppingListId: shoppingList.id })

    expect(result.ok).toBe(true)
    expect(
      shoppingListItemRepository.deleteCheckedByShoppingListId,
    ).toHaveBeenCalledTimes(1)
    expect(
      shoppingListItemRepository.deleteCheckedByShoppingListId,
    ).toHaveBeenCalledWith(shoppingList.id)
  })

  test('works on any shopping list', async () => {
    const shoppingList = createTestShoppingList(householdId)
    const shoppingListRepository =
      createMockShoppingListRepository(shoppingList)
    const shoppingListItemRepository = createMockShoppingListItemRepository()
    const handler = new ClearCheckedItemsCommandHandler(
      shoppingListRepository,
      shoppingListItemRepository,
    )

    const result = await handler.execute({ shoppingListId: shoppingList.id })

    expect(result.ok).toBe(true)
    expect(
      shoppingListItemRepository.deleteCheckedByShoppingListId,
    ).toHaveBeenCalledTimes(1)
  })

  test('returns SHOPPING_LIST_NOT_FOUND when list does not exist', async () => {
    const shoppingListRepository = createMockShoppingListRepository(null)
    const shoppingListItemRepository = createMockShoppingListItemRepository()
    const handler = new ClearCheckedItemsCommandHandler(
      shoppingListRepository,
      shoppingListItemRepository,
    )

    const result = await handler.execute({ shoppingListId: 'non-existent-id' })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_NOT_FOUND')
    expect(result.error.id).toBe('non-existent-id')
    expect(
      shoppingListItemRepository.deleteCheckedByShoppingListId,
    ).not.toHaveBeenCalled()
  })
})

import { describe, expect, mock, test } from 'bun:test'
import { parseHouseholdId } from '@/domain/shared/household-id'
import { ShoppingList } from '@/domain/shopping-list/shopping-list'
import { generateShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { DeleteShoppingListCommandHandler } from './delete-shopping-list'

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
  count: number,
): ShoppingListRepository {
  return {
    findById: mock(() => Promise.resolve(list)),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    countByHouseholdId: mock(() => Promise.resolve(count)),
  }
}

describe('DeleteShoppingListCommandHandler', () => {
  const householdId = '00000000-0000-0000-0000-000000000001'

  test('deletes shopping list successfully when multiple lists exist', async () => {
    const shoppingList = createTestShoppingList(householdId)
    const repository = createMockRepository(shoppingList, 3)
    const handler = new DeleteShoppingListCommandHandler(repository)

    const result = await handler.execute({ shoppingListId: shoppingList.id })

    expect(result.ok).toBe(true)
    expect(repository.delete).toHaveBeenCalledTimes(1)
  })

  test('returns SHOPPING_LIST_NOT_FOUND when list does not exist', async () => {
    const repository = createMockRepository(null, 3)
    const handler = new DeleteShoppingListCommandHandler(repository)

    const result = await handler.execute({ shoppingListId: 'non-existent-id' })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_NOT_FOUND')
    if (result.error.type === 'SHOPPING_LIST_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-id')
    }
    expect(repository.delete).not.toHaveBeenCalled()
  })

  test('returns CANNOT_DELETE_LAST_SHOPPING_LIST when only one list exists', async () => {
    const shoppingList = createTestShoppingList(householdId)
    const repository = createMockRepository(shoppingList, 1)
    const handler = new DeleteShoppingListCommandHandler(repository)

    const result = await handler.execute({ shoppingListId: shoppingList.id })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('CANNOT_DELETE_LAST_SHOPPING_LIST')
    expect(repository.delete).not.toHaveBeenCalled()
  })

  test('allows deletion when exactly two lists exist', async () => {
    const shoppingList = createTestShoppingList(householdId)
    const repository = createMockRepository(shoppingList, 2)
    const handler = new DeleteShoppingListCommandHandler(repository)

    const result = await handler.execute({ shoppingListId: shoppingList.id })

    expect(result.ok).toBe(true)
    expect(repository.delete).toHaveBeenCalledTimes(1)
  })
})

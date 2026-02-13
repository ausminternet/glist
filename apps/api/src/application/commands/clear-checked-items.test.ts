import { parseHouseholdId } from '@/domain/shared/household-id'
import { ShoppingList } from '@/domain/shopping-list/shopping-list'
import { generateShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { describe, expect, mock, test } from 'bun:test'
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

describe('ClearCheckedItemsCommandHandler', () => {
  const householdId = '00000000-0000-0000-0000-000000000001'

  test('removes all checked items', async () => {
    const shoppingList = createTestShoppingList(householdId)

    shoppingList.addItem({ name: 'Milk' })
    shoppingList.addItem({ name: 'Bread' })
    shoppingList.addItem({ name: 'Eggs' })

    shoppingList.items[0].check()
    shoppingList.items[2].check()

    expect(shoppingList.items).toHaveLength(3)

    const repository = createMockRepository(shoppingList)
    const handler = new ClearCheckedItemsCommandHandler(repository)

    const result = await handler.execute(shoppingList.id, { householdId })

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(shoppingList.items).toHaveLength(1)
    expect(shoppingList.items[0].name).toBe('Bread')
  })

  test('does nothing when no items are checked', async () => {
    const shoppingList = createTestShoppingList(householdId)

    shoppingList.addItem({ name: 'Milk' })
    shoppingList.addItem({ name: 'Bread' })

    const repository = createMockRepository(shoppingList)
    const handler = new ClearCheckedItemsCommandHandler(repository)

    const result = await handler.execute(shoppingList.id, { householdId })

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(shoppingList.items).toHaveLength(2)
  })

  test('clears all items when all are checked', async () => {
    const shoppingList = createTestShoppingList(householdId)

    shoppingList.addItem({ name: 'Milk' })
    shoppingList.addItem({ name: 'Bread' })

    shoppingList.items[0].check()
    shoppingList.items[1].check()

    const repository = createMockRepository(shoppingList)
    const handler = new ClearCheckedItemsCommandHandler(repository)

    const result = await handler.execute(shoppingList.id, { householdId })

    expect(result.ok).toBe(true)
    expect(shoppingList.items).toHaveLength(0)
  })

  test('works on empty shopping list', async () => {
    const shoppingList = createTestShoppingList(householdId)
    const repository = createMockRepository(shoppingList)
    const handler = new ClearCheckedItemsCommandHandler(repository)

    const result = await handler.execute(shoppingList.id, { householdId })

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(shoppingList.items).toHaveLength(0)
  })

  test('returns SHOPPING_LIST_NOT_FOUND when list does not exist', async () => {
    const repository = createMockRepository(null)
    const handler = new ClearCheckedItemsCommandHandler(repository)

    const result = await handler.execute('non-existent-id', { householdId })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_NOT_FOUND')
    expect(result.error.id).toBe('non-existent-id')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns SHOPPING_LIST_NOT_FOUND when list belongs to different household', async () => {
    const shoppingList = createTestShoppingList(
      '00000000-0000-0000-0000-000000000002',
    )
    shoppingList.addItem({ name: 'Milk' })
    shoppingList.items[0].check()

    const repository = createMockRepository(shoppingList)
    const handler = new ClearCheckedItemsCommandHandler(repository)

    const result = await handler.execute(shoppingList.id, { householdId })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_NOT_FOUND')
    expect(repository.save).not.toHaveBeenCalled()
  })
})

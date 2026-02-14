import { describe, expect, mock, test } from 'bun:test'
import { parseHouseholdId } from '@/domain/shared/household-id'
import { ShoppingList } from '@/domain/shopping-list/shopping-list'
import { generateShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import {
  type ReplaceShoppingListItemCommand,
  ReplaceShoppingListItemCommandHandler,
} from './replace-shopping-list-item'

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

const validCommand: Omit<
  ReplaceShoppingListItemCommand,
  'shoppingListId' | 'itemId'
> = {
  name: 'Updated Milk',
  description: 'Updated description',
  categoryId: null,
  quantity: 2,
  quantityUnit: 'l',
  shopIds: [],
}

describe('ReplaceShoppingListItemCommandHandler', () => {
  const householdId = '00000000-0000-0000-0000-000000000001'

  test('replaces item successfully', async () => {
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({ name: 'Milk', description: 'Original' })
    const item = shoppingList.items[0]

    const repository = createMockRepository(shoppingList)
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      {
        ...validCommand,
        shoppingListId: shoppingList.id,
        itemId: item.id,
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.name).toBe('Updated Milk')
    expect(item.description).toBe('Updated description')
    expect(item.quantity).toBe(2)
    expect(item.quantityUnit).toBe('l')
  })

  test('returns SHOPPING_LIST_NOT_FOUND when list does not exist', async () => {
    const repository = createMockRepository(null)
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      {
        ...validCommand,
        shoppingListId: 'non-existent-list',
        itemId: 'some-item-id',
      },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_NOT_FOUND')
    if (result.error.type === 'SHOPPING_LIST_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-list')
    }
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns SHOPPING_LIST_NOT_FOUND when list belongs to different household', async () => {
    const shoppingList = createTestShoppingList(
      '00000000-0000-0000-0000-000000000002',
    )
    shoppingList.addItem({ name: 'Milk' })
    const item = shoppingList.items[0]

    const repository = createMockRepository(shoppingList)
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      {
        ...validCommand,
        shoppingListId: shoppingList.id,
        itemId: item.id,
      },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_NOT_FOUND')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns SHOPPING_LIST_ITEM_NOT_FOUND when item does not exist', async () => {
    const shoppingList = createTestShoppingList(householdId)
    const repository = createMockRepository(shoppingList)
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      {
        ...validCommand,
        shoppingListId: shoppingList.id,
        itemId: 'non-existent-item',
      },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_ITEM_NOT_FOUND')
    if (result.error.type === 'SHOPPING_LIST_ITEM_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-item')
    }
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('clears optional fields when set to null', async () => {
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({
      name: 'Milk',
      description: 'Some description',
      quantity: 5,
      quantityUnit: 'l',
    })
    const item = shoppingList.items[0]

    const repository = createMockRepository(shoppingList)
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const command: ReplaceShoppingListItemCommand = {
      shoppingListId: shoppingList.id,
      itemId: item.id,
      name: 'Simple Item',
      description: null,
      categoryId: null,
      quantity: null,
      quantityUnit: null,
      shopIds: [],
    }

    const result = await handler.execute(command, {
      householdId,
    })

    expect(result.ok).toBe(true)
    expect(item.description).toBeNull()
    expect(item.quantity).toBeNull()
    expect(item.quantityUnit).toBeNull()
  })

  test('updates updatedAt timestamp', async () => {
    const shoppingList = createTestShoppingList(householdId)
    shoppingList.addItem({ name: 'Milk' })
    const item = shoppingList.items[0]

    const repository = createMockRepository(shoppingList)
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      {
        ...validCommand,
        shoppingListId: shoppingList.id,
        itemId: item.id,
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})

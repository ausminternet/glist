import { describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import {
  createMockShoppingListItemRepository,
  createTestShoppingListItem,
} from '@/test'
import {
  type ReplaceShoppingListItemCommand,
  ReplaceShoppingListItemCommandHandler,
} from './replace-shopping-list-item'

const validCommand: Omit<ReplaceShoppingListItemCommand, 'itemId'> = {
  name: 'Updated Milk',
  description: 'Updated description',
  categoryId: null,
  quantity: 2,
  quantityUnit: 'l',
  shopIds: [],
}

const householdId = generateHouseholdId()

describe('ReplaceShoppingListItemCommandHandler', () => {
  test('replaces item successfully', async () => {
    const item = createTestShoppingListItem({
      householdId,
      name: 'Milk',
      description: 'Original',
    })
    const repository = createMockShoppingListItemRepository([item])
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      { ...validCommand, itemId: item.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.name).toBe('Updated Milk')
    expect(item.description).toBe('Updated description')
    expect(item.quantity).toBe(2)
    expect(item.quantityUnit).toBe('l')
  })

  test('returns SHOPPING_LIST_ITEM_NOT_FOUND when item does not exist', async () => {
    const repository = createMockShoppingListItemRepository()
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      {
        ...validCommand,
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
    const item = createTestShoppingListItem({ householdId, name: 'Milk' })
    const repository = createMockShoppingListItemRepository([item])
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      {
        itemId: item.id,
        name: 'Simple Item',
        description: null,
        categoryId: null,
        quantity: null,
        quantityUnit: null,
        shopIds: [],
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(item.description).toBeNull()
    expect(item.quantity).toBeNull()
    expect(item.quantityUnit).toBeNull()
  })

  test('updates updatedAt timestamp', async () => {
    const item = createTestShoppingListItem({ householdId, name: 'Milk' })
    const repository = createMockShoppingListItemRepository([item])
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      { ...validCommand, itemId: item.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})

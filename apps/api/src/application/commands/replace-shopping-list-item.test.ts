import { describe, expect, test } from 'bun:test'
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

describe('ReplaceShoppingListItemCommandHandler', () => {
  test('replaces item successfully', async () => {
    const item = createTestShoppingListItem({
      name: 'Milk',
      description: 'Original',
    })
    const repository = createMockShoppingListItemRepository([item])
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute({ ...validCommand, itemId: item.id })

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

    const result = await handler.execute({
      ...validCommand,
      itemId: 'non-existent-item',
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_ITEM_NOT_FOUND')
    if (result.error.type === 'SHOPPING_LIST_ITEM_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-item')
    }
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('clears optional fields when set to null', async () => {
    const item = createTestShoppingListItem({ name: 'Milk' })
    const repository = createMockShoppingListItemRepository([item])
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute({
      itemId: item.id,
      name: 'Simple Item',
      description: null,
      categoryId: null,
      quantity: null,
      quantityUnit: null,
      shopIds: [],
    })

    expect(result.ok).toBe(true)
    expect(item.description).toBeNull()
    expect(item.quantity).toBeNull()
    expect(item.quantityUnit).toBeNull()
  })

  test('updates updatedAt timestamp', async () => {
    const item = createTestShoppingListItem({ name: 'Milk' })
    const repository = createMockShoppingListItemRepository([item])
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute({ ...validCommand, itemId: item.id })

    expect(result.ok).toBe(true)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})

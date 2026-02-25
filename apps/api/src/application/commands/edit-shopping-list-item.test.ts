import { beforeEach, describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import type { ShoppingListItem } from '@/domain/shopping-list-item/shopping-list-item'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import {
  createMockShoppingListItemRepository,
  createTestShoppingListItem,
} from '@/test'
import {
  type EditShoppingListItemCommand,
  EditShoppingListItemCommandHandler,
} from './edit-shopping-list-item'

const householdId = generateHouseholdId()

const validCommand: Omit<EditShoppingListItemCommand, 'itemId'> = {
  name: 'Updated Milk',
  description: 'Updated description',
  quantity: 2,
  quantityUnit: 'l',
  categoryId: null,
  shopIds: [],
  inventoryItemId: null,
}

describe('ReplaceShoppingListItemCommandHandler', () => {
  let item: ShoppingListItem
  let repository: ShoppingListItemRepository
  let handler: EditShoppingListItemCommandHandler

  beforeEach(() => {
    item = createTestShoppingListItem({ householdId, name: 'Milk' })
    repository = createMockShoppingListItemRepository([item])
    handler = new EditShoppingListItemCommandHandler(repository)
  })

  test('replaces item successfully', async () => {
    const result = await handler.execute(
      { ...validCommand, itemId: item.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.name).toBe('Updated Milk')
  })

  test('returns SHOPPING_LIST_ITEM_NOT_FOUND when item does not exist', async () => {
    const result = await handler.execute(
      { ...validCommand, itemId: 'non-existent-id' },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_ITEM_NOT_FOUND')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('clears optional fields when set to null', async () => {
    const command: EditShoppingListItemCommand = {
      itemId: item.id,
      name: 'Simple Item',
      description: null,
      quantity: null,
      quantityUnit: null,
      categoryId: null,
      shopIds: [],
      inventoryItemId: null,
    }

    const result = await handler.execute(command, { householdId })

    expect(result.ok).toBe(true)
    expect(item.quantity).toBeNull()
  })
})

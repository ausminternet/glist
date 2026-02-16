import { beforeEach, describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import {
  createMockInventoryItemRepository,
  createMockShoppingListItemRepositoryWithCapture,
  createTestInventoryItem,
} from '@/test'
import { AddShoppingListItemFromInventoryCommandHandler } from './add-shopping-list-item-from-inventory'

const householdId = generateHouseholdId()

describe('AddShoppingListItemFromInventoryCommandHandler', () => {
  let inventoryItemRepository: InventoryItemRepository
  let shoppingListItemRepository: ReturnType<
    typeof createMockShoppingListItemRepositoryWithCapture
  >
  let handler: AddShoppingListItemFromInventoryCommandHandler

  beforeEach(() => {
    shoppingListItemRepository =
      createMockShoppingListItemRepositoryWithCapture()
  })

  test('adds item from inventory to shopping list', async () => {
    const item = createTestInventoryItem({ householdId, name: 'Milk' })
    inventoryItemRepository = createMockInventoryItemRepository([item])
    handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListItemRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      { inventoryItemId: item.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(shoppingListItemRepository.save).toHaveBeenCalledTimes(1)
    expect(shoppingListItemRepository.savedItem?.name).toBe('Milk')
    expect(shoppingListItemRepository.savedItem?.householdId).toBe(householdId)
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    inventoryItemRepository = createMockInventoryItemRepository([])
    handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListItemRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      { inventoryItemId: 'non-existent-id' },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVENTORY_ITEM_NOT_FOUND')
    expect(shoppingListItemRepository.save).not.toHaveBeenCalled()
  })

  test('returns the id of the newly created shopping list item', async () => {
    const item = createTestInventoryItem({ householdId })
    inventoryItemRepository = createMockInventoryItemRepository([item])
    handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListItemRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      { inventoryItemId: item.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    if (!shoppingListItemRepository.savedItem)
      throw new Error('Shopping list item not saved')
    expect(result.value.value).toBe(shoppingListItemRepository.savedItem.id)
  })
})

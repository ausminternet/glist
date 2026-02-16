import { describe, expect, test } from 'bun:test'
import { parseCategoryId } from '@/domain/category/category-id'
import { parseHouseholdId } from '@/domain/household/household-id'
import { parseShopIds } from '@/domain/shop/shop-id'
import {
  createMockInventoryItemRepository,
  createMockShoppingListItemRepositoryWithCapture,
  createTestInventoryItem,
} from '@/test'
import { AddShoppingListItemFromInventoryCommandHandler } from './add-shopping-list-item-from-inventory'

const householdId = parseHouseholdId('00000000-0000-0000-0000-000000000001')

describe('AddShoppingListItemFromInventoryCommandHandler', () => {
  test('adds item from inventory to shopping list', async () => {
    const inventoryItem = createTestInventoryItem({
      householdId,
      name: 'Milk',
      description: 'Organic whole milk',
    })
    const shoppingListItemRepository =
      createMockShoppingListItemRepositoryWithCapture()
    const inventoryItemRepository = createMockInventoryItemRepository([
      inventoryItem,
    ])
    const handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListItemRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      {
        inventoryItemId: inventoryItem.id,
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(shoppingListItemRepository.save).toHaveBeenCalledTimes(1)
    expect(shoppingListItemRepository.savedItem).not.toBeNull()

    const addedItem = shoppingListItemRepository.savedItem
    if (!addedItem) throw new Error('Shopping list item not found')
    expect(addedItem.name).toBe('Milk')
    expect(addedItem.description).toBe('Organic whole milk')
    expect(addedItem.inventoryItemId).toBe(inventoryItem.id)
  })

  test('copies category and shops from inventory item', async () => {
    const categoryId = parseCategoryId('00000000-0000-0000-0000-0000000000ca')
    const shopIds = parseShopIds([
      '00000000-0000-0000-0000-0000000000a1',
      '00000000-0000-0000-0000-0000000000a2',
    ])
    const inventoryItem = createTestInventoryItem({
      householdId,
      categoryId,
      shopIds,
    })
    const shoppingListItemRepository =
      createMockShoppingListItemRepositoryWithCapture()
    const inventoryItemRepository = createMockInventoryItemRepository([
      inventoryItem,
    ])
    const handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListItemRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      {
        inventoryItemId: inventoryItem.id,
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const addedItem = shoppingListItemRepository.savedItem
    if (!addedItem) throw new Error('Shopping list item not found')
    expect(addedItem.categoryId).toBe(categoryId)
    expect(addedItem.shopIds).toEqual(shopIds)
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    const shoppingListItemRepository =
      createMockShoppingListItemRepositoryWithCapture()
    const inventoryItemRepository = createMockInventoryItemRepository()
    const handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListItemRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      { inventoryItemId: 'non-existent-item' },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVENTORY_ITEM_NOT_FOUND')
    expect(result.error.id).toBe('non-existent-item')
    expect(shoppingListItemRepository.save).not.toHaveBeenCalled()
  })

  test('returns the id of the newly created shopping list item', async () => {
    const inventoryItem = createTestInventoryItem({ householdId })
    const shoppingListItemRepository =
      createMockShoppingListItemRepositoryWithCapture()
    const inventoryItemRepository = createMockInventoryItemRepository([
      inventoryItem,
    ])
    const handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListItemRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      { inventoryItemId: inventoryItem.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const savedItem = shoppingListItemRepository.savedItem
    if (!savedItem) throw new Error('Shopping list item not found')
    expect(result.value.value).toBe(savedItem.id)
    expect(result.value.event).toEqual({
      type: 'item-added',
      householdId,
      itemId: savedItem.id,
    })
  })
})

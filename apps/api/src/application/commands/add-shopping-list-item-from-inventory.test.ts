import { describe, expect, mock, test } from 'bun:test'
import { parseCategoryId } from '@/domain/category/category-id'
import { InventoryItem } from '@/domain/inventory-item/inventory-item'
import { generateInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { parseHouseholdId } from '@/domain/shared/household-id'
import { parseShopIds } from '@/domain/shop/shop-id'
import type { ShoppingListItem } from '@/domain/shopping-list-item/shopping-list-item'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import { AddShoppingListItemFromInventoryCommandHandler } from './add-shopping-list-item-from-inventory'

function createTestInventoryItem(
  householdId: string,
  options?: {
    name?: string
    description?: string
    categoryId?: string
    shopIds?: string[]
  },
) {
  const result = InventoryItem.create(
    generateInventoryItemId(),
    parseHouseholdId(householdId),
    {
      name: options?.name ?? 'Milk',
      description: options?.description ?? 'Organic whole milk',
      categoryId: options?.categoryId
        ? parseCategoryId(options.categoryId)
        : undefined,
      shopIds: options?.shopIds ? parseShopIds(options.shopIds) : undefined,
    },
  )
  if (!result.ok) throw new Error('Failed to create test inventory item')
  return result.value
}

function createMockShoppingListItemRepository(): ShoppingListItemRepository & {
  savedItem: ShoppingListItem | null
} {
  const repository = {
    savedItem: null as ShoppingListItem | null,
    find: mock(() => Promise.resolve(null)),
    save: mock((item: ShoppingListItem) => {
      repository.savedItem = item
      return Promise.resolve()
    }),
    delete: mock(() => Promise.resolve()),
    deleteCheckedByHouseholdId: mock(() => Promise.resolve()),
  }
  return repository
}

function createMockInventoryItemRepository(
  item: InventoryItem | null,
): InventoryItemRepository {
  return {
    findById: mock(() => Promise.resolve(item)),
    findAllByHouseholdId: mock(() => Promise.resolve([])),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
  }
}

describe('AddShoppingListItemFromInventoryCommandHandler', () => {
  const householdId = '00000000-0000-0000-0000-000000000001'

  test('adds item from inventory to shopping list', async () => {
    const inventoryItem = createTestInventoryItem(householdId, {
      name: 'Milk',
      description: 'Organic whole milk',
    })
    const shoppingListItemRepository = createMockShoppingListItemRepository()
    const inventoryItemRepository =
      createMockInventoryItemRepository(inventoryItem)
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
    const categoryId = '00000000-0000-0000-0000-0000000000ca'
    const shopIds = [
      '00000000-0000-0000-0000-0000000000a1',
      '00000000-0000-0000-0000-0000000000a2',
    ]
    const inventoryItem = createTestInventoryItem(householdId, {
      categoryId,
      shopIds,
    })
    const shoppingListItemRepository = createMockShoppingListItemRepository()
    const inventoryItemRepository =
      createMockInventoryItemRepository(inventoryItem)
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
    expect(addedItem.categoryId).toBe(parseCategoryId(categoryId))
    expect(addedItem.shopIds).toEqual(parseShopIds(shopIds))
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    const shoppingListItemRepository = createMockShoppingListItemRepository()
    const inventoryItemRepository = createMockInventoryItemRepository(null)
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
    const inventoryItem = createTestInventoryItem(householdId)
    const shoppingListItemRepository = createMockShoppingListItemRepository()
    const inventoryItemRepository =
      createMockInventoryItemRepository(inventoryItem)
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

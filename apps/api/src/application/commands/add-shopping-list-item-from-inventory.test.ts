import { parseCategoryId } from '@/domain/category/category-id'
import { InventoryItem } from '@/domain/inventory-item/inventory-item'
import { generateInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { parseHouseholdId } from '@/domain/shared/household-id'
import { parseShopIds } from '@/domain/shop/shop-id'
import { ShoppingList } from '@/domain/shopping-list/shopping-list'
import { generateShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { describe, expect, mock, test } from 'bun:test'
import { AddShoppingListItemFromInventoryCommandHandler } from './add-shopping-list-item-from-inventory'

function createTestShoppingList(householdId: string) {
  const result = ShoppingList.create(
    generateShoppingListId(),
    parseHouseholdId(householdId),
    'Test Shopping List',
  )
  if (!result.ok) throw new Error('Failed to create test shopping list')
  return result.value
}

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
    const shoppingList = createTestShoppingList(householdId)
    const inventoryItem = createTestInventoryItem(householdId, {
      name: 'Milk',
      description: 'Organic whole milk',
    })
    const shoppingListRepository =
      createMockShoppingListRepository(shoppingList)
    const inventoryItemRepository =
      createMockInventoryItemRepository(inventoryItem)
    const handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      shoppingList.id,
      { inventoryItemId: inventoryItem.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(shoppingListRepository.save).toHaveBeenCalledTimes(1)
    expect(shoppingList.items).toHaveLength(1)

    const addedItem = shoppingList.items[0]
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
    const shoppingList = createTestShoppingList(householdId)
    const inventoryItem = createTestInventoryItem(householdId, {
      categoryId,
      shopIds,
    })
    const shoppingListRepository =
      createMockShoppingListRepository(shoppingList)
    const inventoryItemRepository =
      createMockInventoryItemRepository(inventoryItem)
    const handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      shoppingList.id,
      { inventoryItemId: inventoryItem.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const addedItem = shoppingList.items[0]
    expect(addedItem.categoryId).toBe(parseCategoryId(categoryId))
    expect(addedItem.shopIds).toEqual(parseShopIds(shopIds))
  })

  test('returns SHOPPING_LIST_NOT_FOUND when list does not exist', async () => {
    const inventoryItem = createTestInventoryItem(householdId)
    const shoppingListRepository = createMockShoppingListRepository(null)
    const inventoryItemRepository =
      createMockInventoryItemRepository(inventoryItem)
    const handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      'non-existent-list',
      { inventoryItemId: inventoryItem.id },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_NOT_FOUND')
    expect(result.error.id).toBe('non-existent-list')
    expect(shoppingListRepository.save).not.toHaveBeenCalled()
  })

  test('returns SHOPPING_LIST_NOT_FOUND when list belongs to different household', async () => {
    const shoppingList = createTestShoppingList(
      '00000000-0000-0000-0000-000000000002',
    )
    const inventoryItem = createTestInventoryItem(householdId)
    const shoppingListRepository =
      createMockShoppingListRepository(shoppingList)
    const inventoryItemRepository =
      createMockInventoryItemRepository(inventoryItem)
    const handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      shoppingList.id,
      { inventoryItemId: inventoryItem.id },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_NOT_FOUND')
    expect(shoppingListRepository.save).not.toHaveBeenCalled()
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    const shoppingList = createTestShoppingList(householdId)
    const shoppingListRepository =
      createMockShoppingListRepository(shoppingList)
    const inventoryItemRepository = createMockInventoryItemRepository(null)
    const handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      shoppingList.id,
      { inventoryItemId: 'non-existent-item' },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVENTORY_ITEM_NOT_FOUND')
    expect(result.error.id).toBe('non-existent-item')
    expect(shoppingListRepository.save).not.toHaveBeenCalled()
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item belongs to different household', async () => {
    const shoppingList = createTestShoppingList(householdId)
    const inventoryItem = createTestInventoryItem(
      '00000000-0000-0000-0000-000000000002',
    )
    const shoppingListRepository =
      createMockShoppingListRepository(shoppingList)
    const inventoryItemRepository =
      createMockInventoryItemRepository(inventoryItem)
    const handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      shoppingList.id,
      { inventoryItemId: inventoryItem.id },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVENTORY_ITEM_NOT_FOUND')
    expect(shoppingListRepository.save).not.toHaveBeenCalled()
  })

  test('returns the id of the newly created shopping list item', async () => {
    const shoppingList = createTestShoppingList(householdId)
    const inventoryItem = createTestInventoryItem(householdId)
    const shoppingListRepository =
      createMockShoppingListRepository(shoppingList)
    const inventoryItemRepository =
      createMockInventoryItemRepository(inventoryItem)
    const handler = new AddShoppingListItemFromInventoryCommandHandler(
      shoppingListRepository,
      inventoryItemRepository,
    )

    const result = await handler.execute(
      shoppingList.id,
      { inventoryItemId: inventoryItem.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value).toBe(shoppingList.items[0].id)
  })
})

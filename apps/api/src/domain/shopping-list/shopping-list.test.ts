import { describe, expect, test } from 'bun:test'
import { parseCategoryId } from '../category/category-id'
import { parseInventoryItemId } from '../inventory-item/inventory-item-id'
import { parseHouseholdId } from '../shared/household-id'
import { parseShopIds } from '../shared/shop-id'
import { ShoppingList } from './shopping-list'
import { generateShoppingListId } from './shopping-list-id'

describe('ShoppingList', () => {
  const householdId = parseHouseholdId('00000000-0000-0000-0000-000000000123')

  describe('create', () => {
    test('creates list with name', () => {
      const result = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )

      expect(result.ok).toBe(true)
      if (!result.ok) return

      const list = result.value
      expect(list.id).toBeDefined()
      expect(list.householdId).toBe(householdId)
      expect(list.name).toBe('Weekly Shopping')
      expect(list.items).toEqual([])
      expect(list.createdAt).toBeInstanceOf(Date)
      expect(list.updatedAt).toBeNull()
    })

    test('returns INVALID_NAME error for empty name', () => {
      const result1 = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        '',
      )
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })

      const result2 = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        '   ',
      )
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })
    })
  })

  describe('validation on change', () => {
    test('changeName returns INVALID_NAME error for empty name', () => {
      const createResult = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const list = createResult.value

      const result1 = list.changeName('')
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })

      const result2 = list.changeName('   ')
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })
    })
  })

  describe('item operations', () => {
    test('addItem adds item to list', () => {
      const createResult = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const list = createResult.value
      const itemResult = list.addItem({ name: 'Milk' })

      expect(itemResult.ok).toBe(true)
      if (!itemResult.ok) return

      const item = itemResult.value
      expect(list.items).toHaveLength(1)
      expect(list.items[0]).toBe(item)
      expect(item.shoppingListId).toBe(list.id)
    })

    test('removeItem removes item from list', () => {
      const createResult = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const list = createResult.value
      const itemResult = list.addItem({ name: 'Milk' })
      expect(itemResult.ok).toBe(true)
      if (!itemResult.ok) return

      const item = itemResult.value
      const removeResult = list.removeItem(item.id)

      expect(removeResult.ok).toBe(true)
      expect(list.items).toHaveLength(0)
    })

    test('removeItem returns SHOPPING_LIST_ITEM_NOT_FOUND error for non-existent item', () => {
      const createResult = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const list = createResult.value
      const removeResult = list.removeItem('non-existent-id')

      expect(removeResult.ok).toBe(false)
      if (removeResult.ok) return
      expect(removeResult.error).toEqual({
        type: 'SHOPPING_LIST_ITEM_NOT_FOUND',
        id: 'non-existent-id',
      })
    })

    test('getItem returns item by id', () => {
      const createResult = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const list = createResult.value
      const itemResult = list.addItem({ name: 'Milk' })
      expect(itemResult.ok).toBe(true)
      if (!itemResult.ok) return

      const item = itemResult.value
      const getResult = list.getItem(item.id)

      expect(getResult.ok).toBe(true)
      if (!getResult.ok) return
      expect(getResult.value).toBe(item)
    })

    test('getItem returns SHOPPING_LIST_ITEM_NOT_FOUND error for non-existent item', () => {
      const createResult = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const list = createResult.value
      const getResult = list.getItem('non-existent-id')

      expect(getResult.ok).toBe(false)
      if (getResult.ok) return
      expect(getResult.error).toEqual({
        type: 'SHOPPING_LIST_ITEM_NOT_FOUND',
        id: 'non-existent-id',
      })
    })

    test('findItem returns undefined for non-existent item', () => {
      const createResult = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const list = createResult.value
      expect(list.findItem('non-existent-id')).toBeUndefined()
    })
  })

  describe('clearChecked', () => {
    test('removes all checked items', () => {
      const createResult = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const list = createResult.value

      const milkResult = list.addItem({ name: 'Milk' })
      expect(milkResult.ok).toBe(true)
      if (!milkResult.ok) return
      const milk = milkResult.value

      const breadResult = list.addItem({ name: 'Bread' })
      expect(breadResult.ok).toBe(true)
      if (!breadResult.ok) return

      const eggsResult = list.addItem({ name: 'Eggs' })
      expect(eggsResult.ok).toBe(true)
      if (!eggsResult.ok) return
      const eggs = eggsResult.value

      milk.check()
      eggs.check()
      list.clearChecked()

      expect(list.items).toHaveLength(1)
      expect(list.items[0].name).toBe('Bread')
    })
  })

  describe('addItemFromInventory', () => {
    test('adds item from inventory to list', () => {
      const createResult = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const list = createResult.value
      const inventoryItem = {
        inventoryItemId: parseInventoryItemId(
          '00000000-0000-0000-0000-000000000001',
        ),
        name: 'Milk',
        description: 'Organic whole milk',
        categoryId: parseCategoryId('00000000-0000-0000-0000-000000000002'),
        shopIds: parseShopIds([
          '00000000-0000-0000-0000-000000000003',
          '00000000-0000-0000-0000-000000000004',
        ]),
      }

      const shoppingListItem = list.addItemFromInventory(inventoryItem)

      expect(list.items).toHaveLength(1)
      expect(list.items[0]).toBe(shoppingListItem)
      expect(shoppingListItem.shoppingListId).toBe(list.id)
      expect(shoppingListItem.name).toBe(inventoryItem.name)
      expect(shoppingListItem.description).toBe(inventoryItem.description)
      expect(shoppingListItem.categoryId).toBe(inventoryItem.categoryId)
      expect(shoppingListItem.shopIds).toEqual(inventoryItem.shopIds)
    })
  })
})

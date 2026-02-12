import { describe, expect, test } from 'bun:test'
import { InvalidNameError, ShoppingListItemNotFoundError } from './errors'
import { ShoppingList } from './shopping-list'

describe('ShoppingList', () => {
  const householdId = 'household-123'

  describe('create', () => {
    test('creates list with name', () => {
      const list = ShoppingList.create(householdId, 'Weekly Shopping')

      expect(list.id).toBeDefined()
      expect(list.householdId).toBe(householdId)
      expect(list.name).toBe('Weekly Shopping')
      expect(list.items).toEqual([])
      expect(list.createdAt).toBeInstanceOf(Date)
      expect(list.updatedAt).toBeNull()
    })

    test('throws InvalidNameError for empty name', () => {
      expect(() => ShoppingList.create(householdId, '')).toThrow(
        InvalidNameError,
      )
      expect(() => ShoppingList.create(householdId, '   ')).toThrow(
        InvalidNameError,
      )
    })
  })

  describe('reconstitute', () => {
    test('restores list from database', () => {
      const createdAt = new Date('2024-01-01')
      const updatedAt = new Date('2024-01-02')

      const list = ShoppingList.reconstitute({
        id: 'list-456',
        householdId: 'household-789',
        name: 'Groceries',
        items: [],
        createdAt,
        updatedAt,
      })

      expect(list.id).toBe('list-456')
      expect(list.householdId).toBe('household-789')
      expect(list.name).toBe('Groceries')
      expect(list.createdAt).toBe(createdAt)
      expect(list.updatedAt).toBe(updatedAt)
    })
  })

  describe('validation on change', () => {
    test('changeName throws InvalidNameError for empty name', () => {
      const list = ShoppingList.create(householdId, 'Weekly Shopping')

      expect(() => list.changeName('')).toThrow(InvalidNameError)
      expect(() => list.changeName('   ')).toThrow(InvalidNameError)
    })
  })

  describe('item operations', () => {
    test('addItem adds item to list', () => {
      const list = ShoppingList.create(householdId, 'Weekly Shopping')

      const item = list.addItem({ name: 'Milk' })

      expect(list.items).toHaveLength(1)
      expect(list.items[0]).toBe(item)
      expect(item.shoppingListId).toBe(list.id)
    })

    test('removeItem removes item from list', () => {
      const list = ShoppingList.create(householdId, 'Weekly Shopping')
      const item = list.addItem({ name: 'Milk' })

      list.removeItem(item.id)

      expect(list.items).toHaveLength(0)
    })

    test('removeItem throws ItemNotFoundError for non-existent item', () => {
      const list = ShoppingList.create(householdId, 'Weekly Shopping')

      expect(() => list.removeItem('non-existent-id')).toThrow(
        ShoppingListItemNotFoundError,
      )
    })

    test('getItem returns item by id', () => {
      const list = ShoppingList.create(householdId, 'Weekly Shopping')
      const item = list.addItem({ name: 'Milk' })

      expect(list.getItem(item.id)).toBe(item)
    })

    test('getItem throws ItemNotFoundError for non-existent item', () => {
      const list = ShoppingList.create(householdId, 'Weekly Shopping')

      expect(() => list.getItem('non-existent-id')).toThrow(
        ShoppingListItemNotFoundError,
      )
    })

    test('findItem returns undefined for non-existent item', () => {
      const list = ShoppingList.create(householdId, 'Weekly Shopping')

      expect(list.findItem('non-existent-id')).toBeUndefined()
    })
  })

  describe('clearChecked', () => {
    test('removes all checked items', () => {
      const list = ShoppingList.create(householdId, 'Weekly Shopping')
      const milk = list.addItem({ name: 'Milk' })
      list.addItem({ name: 'Bread' })
      const eggs = list.addItem({ name: 'Eggs' })

      milk.check()
      eggs.check()
      list.clearChecked()

      expect(list.items).toHaveLength(1)
      expect(list.items[0].name).toBe('Bread')
    })
  })

  describe('toSnapshot', () => {
    test('creates snapshot with all data including items', () => {
      const list = ShoppingList.create(householdId, 'Weekly Shopping')
      list.addItem({ name: 'Milk', quantity: 2, quantityUnit: 'l' })

      const snapshot = list.toSnapshot()

      expect(snapshot.id).toBe(list.id)
      expect(snapshot.householdId).toBe(householdId)
      expect(snapshot.name).toBe('Weekly Shopping')
      expect(snapshot.items).toHaveLength(1)
      expect(snapshot.items[0].name).toBe('Milk')
    })
  })

  describe('addItemFromInventory', () => {
    test('adds item from inventory to list', () => {
      const list = ShoppingList.create(householdId, 'Weekly Shopping')
      const inventoryItem = {
        inventoryItemId: 'inv-123',
        name: 'Milk',
        description: 'Organic whole milk',
        categoryId: 'cat-dairy',
        shopIds: ['shop-1', 'shop-2'],
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

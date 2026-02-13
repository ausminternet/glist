import { describe, expect, test } from 'bun:test'
import { ShoppingListItem } from './shopping-list-item'

describe('ShoppingListItem', () => {
  const shoppingListId = 'list-123'

  describe('create', () => {
    test('creates item with all properties', () => {
      const result = ShoppingListItem.create(shoppingListId, {
        name: 'Organic Milk',
        description: 'From the farm',
        categoryId: 'cat-123',
        quantity: 2,
        quantityUnit: 'l',
        shopIds: ['shop-1', 'shop-2'],
      })

      expect(result.ok).toBe(true)
      if (!result.ok) return

      const item = result.value
      expect(item.id).toBeDefined()
      expect(item.shoppingListId).toBe(shoppingListId)
      expect(item.name).toBe('Organic Milk')
      expect(item.description).toBe('From the farm')
      expect(item.categoryId).toBe('cat-123')
      expect(item.quantity).toBe(2)
      expect(item.quantityUnit).toBe('l')
      expect(item.checked).toBe(false)
      expect(item.shopIds).toEqual(['shop-1', 'shop-2'])
      expect(item.createdAt).toBeInstanceOf(Date)
      expect(item.updatedAt).toBeNull()
    })

    test('returns INVALID_NAME error for empty name', () => {
      const result1 = ShoppingListItem.create(shoppingListId, { name: '' })
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({ type: 'INVALID_NAME' })

      const result2 = ShoppingListItem.create(shoppingListId, { name: '   ' })
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({ type: 'INVALID_NAME' })
    })

    test('returns INVALID_QUANTITY error for invalid quantity', () => {
      const result = ShoppingListItem.create(shoppingListId, {
        name: 'Milk',
        quantity: -1,
      })

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error).toEqual({ type: 'INVALID_QUANTITY' })
    })
  })

  describe('reconstitute', () => {
    test('restores item from database', () => {
      const createdAt = new Date('2024-01-01')
      const updatedAt = new Date('2024-01-02')

      const item = ShoppingListItem.reconstitute({
        id: 'item-456',
        shoppingListId: 'list-789',
        name: 'Butter',
        description: 'Irish butter',
        categoryId: 'cat-dairy',
        quantity: 250,
        quantityUnit: 'g',
        checked: true,
        shopIds: ['shop-1'],
        createdAt,
        updatedAt,
        inventoryItemId: null,
      })

      expect(item.id).toBe('item-456')
      expect(item.shoppingListId).toBe('list-789')
      expect(item.name).toBe('Butter')
      expect(item.checked).toBe(true)
      expect(item.createdAt).toBe(createdAt)
      expect(item.updatedAt).toBe(updatedAt)
    })
  })

  describe('validation on change', () => {
    test('changeName returns INVALID_NAME error for empty name', () => {
      const createResult = ShoppingListItem.create(shoppingListId, {
        name: 'Milk',
      })
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const item = createResult.value

      const result1 = item.changeName('')
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({ type: 'INVALID_NAME' })

      const result2 = item.changeName('   ')
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({ type: 'INVALID_NAME' })
    })

    test('changeQuantity returns INVALID_QUANTITY error for invalid quantity', () => {
      const createResult = ShoppingListItem.create(shoppingListId, {
        name: 'Milk',
      })
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const item = createResult.value

      const result = item.changeQuantity(-1, 'kg')
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error).toEqual({ type: 'INVALID_QUANTITY' })
    })
  })

  describe('check/uncheck', () => {
    test('toggleChecked toggles the status', () => {
      const createResult = ShoppingListItem.create(shoppingListId, {
        name: 'Milk',
      })
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const item = createResult.value

      expect(item.checked).toBe(false)
      item.toggleChecked()
      expect(item.checked).toBe(true)
      item.toggleChecked()
      expect(item.checked).toBe(false)
    })
  })

  describe('toSnapshot', () => {
    test('creates snapshot with all data', () => {
      const createResult = ShoppingListItem.create(shoppingListId, {
        name: 'Organic Milk',
        description: 'From the farm',
        categoryId: 'cat-123',
        quantity: 2,
        quantityUnit: 'l',
        shopIds: ['shop-1'],
      })
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const item = createResult.value
      item.check()

      const snapshot = item.toSnapshot()

      expect(snapshot).toEqual({
        id: item.id,
        shoppingListId,
        name: 'Organic Milk',
        description: 'From the farm',
        categoryId: 'cat-123',
        quantity: 2,
        quantityUnit: 'l',
        checked: true,
        shopIds: ['shop-1'],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        inventoryItemId: null,
      })
    })
  })

  describe('createFromInventoryItem', () => {
    test('creates shopping list item from inventory item', () => {
      const inventoryItem = {
        inventoryItemId: 'inv-123',
        name: 'Milk',
        description: 'Organic whole milk',
        categoryId: 'cat-dairy',
        shopIds: ['shop-1', 'shop-2'],
      }

      const shoppingListItem = ShoppingListItem.createFromInventoryItem(
        shoppingListId,
        inventoryItem,
      )

      expect(shoppingListItem.inventoryItemId).toBe(
        inventoryItem.inventoryItemId,
      )
      expect(shoppingListItem.shoppingListId).toBe(shoppingListId)
      expect(shoppingListItem.name).toBe(inventoryItem.name)
      expect(shoppingListItem.description).toBe(inventoryItem.description)
      expect(shoppingListItem.categoryId).toBe(inventoryItem.categoryId)
      expect(shoppingListItem.shopIds).toEqual(inventoryItem.shopIds)
    })
  })
})

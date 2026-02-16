import { describe, expect, test } from 'bun:test'
import { parseCategoryId } from '../category/category-id'
import { generateHouseholdId } from '../household/household-id'
import { parseInventoryItemId } from '../inventory-item/inventory-item-id'
import { parseShopIds } from '../shop/shop-id'
import { ShoppingListItem } from './shopping-list-item'
import { generateShoppingListItemId } from './shopping-list-item-id'

describe('ShoppingListItem', () => {
  const householdId = '12345678-1234-1234-1234-1234567890ab'

  describe('create', () => {
    test('creates item with all properties', () => {
      const result = ShoppingListItem.create(generateShoppingListItemId(), {
        householdId,
        name: 'Organic Milk',
        description: 'From the farm',
        categoryId: parseCategoryId('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
        quantity: 2,
        quantityUnit: 'l',
        shopIds: parseShopIds([
          'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
          'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        ]),
      })

      expect(result.ok).toBe(true)
      if (!result.ok) return

      const item = result.value
      expect(item.id).toBeDefined()
      expect(item.name).toBe('Organic Milk')
      expect(item.description).toBe('From the farm')
      expect(item.categoryId).toBe(
        parseCategoryId('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
      )
      expect(item.quantity).toBe(2)
      expect(item.quantityUnit).toBe('l')
      expect(item.checked).toBe(false)
      expect(item.shopIds).toEqual(
        parseShopIds([
          'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
          'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        ]),
      )
      expect(item.createdAt).toBeInstanceOf(Date)
      expect(item.updatedAt).toBeNull()
    })

    test('returns INVALID_NAME error for empty name', () => {
      const result1 = ShoppingListItem.create(generateShoppingListItemId(), {
        householdId,
        name: '',
      })
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })

      const result2 = ShoppingListItem.create(generateShoppingListItemId(), {
        householdId,
        name: '   ',
      })
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })
    })

    test('returns INVALID_QUANTITY error for invalid quantity', () => {
      const result = ShoppingListItem.create(generateShoppingListItemId(), {
        householdId,
        name: 'Milk',
        quantity: -1,
      })

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error).toEqual({ type: 'INVALID_QUANTITY' })
    })
  })

  describe('validation on change', () => {
    test('changeName returns INVALID_NAME error for empty name', () => {
      const createResult = ShoppingListItem.create(
        generateShoppingListItemId(),
        {
          householdId,
          name: 'Milk',
        },
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const item = createResult.value

      const result1 = item.changeName('')
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })

      const result2 = item.changeName('   ')
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })
    })

    test('changeQuantity returns INVALID_QUANTITY error for invalid quantity', () => {
      const createResult = ShoppingListItem.create(
        generateShoppingListItemId(),
        {
          householdId,
          name: 'Milk',
        },
      )
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
      const createResult = ShoppingListItem.create(
        generateShoppingListItemId(),
        {
          householdId,
          name: 'Milk',
        },
      )
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

  describe('createFromInventoryItem', () => {
    test('creates shopping list item from inventory item', () => {
      const inventoryItem = {
        inventoryItemId: parseInventoryItemId(
          'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
        ),
        householdId: generateHouseholdId(),
        name: 'Milk',
        description: 'Organic whole milk',
        categoryId: parseCategoryId('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66'),
        shopIds: parseShopIds([
          'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
          'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        ]),
      }

      const shoppingListItem = ShoppingListItem.createFromInventoryItem(
        generateShoppingListItemId(),
        { ...inventoryItem, householdId: inventoryItem.householdId },
      )

      expect(shoppingListItem.inventoryItemId).toBe(
        inventoryItem.inventoryItemId,
      )
      expect(shoppingListItem.name).toBe(inventoryItem.name)
      expect(shoppingListItem.description).toBe(inventoryItem.description)
      expect(shoppingListItem.categoryId).toBe(inventoryItem.categoryId)
      expect(shoppingListItem.shopIds).toEqual(inventoryItem.shopIds)
    })
  })
})

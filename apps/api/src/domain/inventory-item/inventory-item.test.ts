import { describe, expect, test } from 'bun:test'
import { parseCategoryId } from '../category/category-id'
import { parseHouseholdId } from '../shared/household-id'
import { parseShopIds } from '../shared/shop-id'
import { InventoryItem } from './inventory-item'
import { generateInventoryItemId } from './inventory-item-id'

describe('InventoryItem', () => {
  const householdId = parseHouseholdId('00000000-0000-0000-0000-000000000123')

  describe('create', () => {
    test('creates item with all properties', () => {
      const result = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        {
          name: 'Milk',
          description: 'Organic whole milk',
          categoryId: parseCategoryId('00000000-0000-0000-0000-00000000da17'),
          targetStock: 2,
          targetStockUnit: 'l',
          basePriceCents: 199,
          basePriceUnit: 'l',
          shopIds: parseShopIds([
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000002',
          ]),
        },
      )

      expect(result.ok).toBe(true)
      if (!result.ok) return

      const item = result.value
      expect(item.id).toBeDefined()
      expect(item.householdId).toBe(householdId)
      expect(item.name).toBe('Milk')
      expect(item.description).toBe('Organic whole milk')
      expect(item.categoryId).toBe(
        parseCategoryId('00000000-0000-0000-0000-00000000da17'),
      )
      expect(item.targetStock).toBe(2)
      expect(item.targetStockUnit).toBe('l')
      expect(item.basePriceCents).toBe(199)
      expect(item.basePriceUnit).toBe('l')
      expect(item.shopIds).toEqual(
        parseShopIds([
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
        ]),
      )
      expect(item.createdAt).toBeInstanceOf(Date)
      expect(item.updatedAt).toBeNull()
    })

    test('creates item with minimal properties', () => {
      const result = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        { name: 'Bread' },
      )

      expect(result.ok).toBe(true)
      if (!result.ok) return

      const item = result.value
      expect(item.name).toBe('Bread')
      expect(item.description).toBeNull()
      expect(item.categoryId).toBeNull()
      expect(item.targetStock).toBeNull()
      expect(item.targetStockUnit).toBeNull()
      expect(item.basePriceCents).toBeNull()
      expect(item.basePriceUnit).toBeNull()
      expect(item.shopIds).toEqual([])
    })

    test('returns INVALID_NAME error for empty name', () => {
      const result1 = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        { name: '' },
      )
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })

      const result2 = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        { name: '   ' },
      )
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })
    })

    test('returns INVALID_QUANTITY error for invalid targetStock', () => {
      const result1 = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        {
          name: 'Milk',
          targetStock: -1,
        },
      )
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({ type: 'INVALID_QUANTITY' })

      const result2 = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        {
          name: 'Milk',
          targetStock: 0,
        },
      )
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({ type: 'INVALID_QUANTITY' })
    })

    test('returns INVALID_PRICE error for negative price', () => {
      const result = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        {
          name: 'Milk',
          basePriceCents: -1,
        },
      )

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error).toEqual({ type: 'INVALID_PRICE' })
    })

    test('returns INVALID_UNIT error for invalid unit', () => {
      const result1 = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        {
          name: 'Milk',
          targetStock: 1,
          targetStockUnit: 'liters',
        },
      )
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({ type: 'INVALID_UNIT', unit: 'liters' })

      const result2 = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        {
          name: 'Milk',
          basePriceCents: 100,
          basePriceUnit: 'euros',
        },
      )
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({ type: 'INVALID_UNIT', unit: 'euros' })
    })
  })

  describe('mutations', () => {
    test('changeName updates name and updatedAt', () => {
      const createResult = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        { name: 'Milk' },
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const item = createResult.value
      expect(item.updatedAt).toBeNull()

      const changeResult = item.changeName('Whole Milk')
      expect(changeResult.ok).toBe(true)

      expect(item.name).toBe('Whole Milk')
      expect(item.updatedAt).toBeInstanceOf(Date)
    })

    test('changeName returns INVALID_NAME error for empty name', () => {
      const createResult = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        { name: 'Milk' },
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

    test('changeTargetStock validates quantity', () => {
      const createResult = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        { name: 'Milk' },
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const item = createResult.value

      const result1 = item.changeTargetStock(-1, 'l')
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({ type: 'INVALID_QUANTITY' })

      const result2 = item.changeTargetStock(1, 'invalid')
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({ type: 'INVALID_UNIT', unit: 'invalid' })
    })

    test('changeBasePrice validates price', () => {
      const createResult = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        { name: 'Milk' },
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const item = createResult.value

      const result1 = item.changeBasePrice(-100, 'l')
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({ type: 'INVALID_PRICE' })

      const result2 = item.changeBasePrice(100, 'invalid')
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({ type: 'INVALID_UNIT', unit: 'invalid' })
    })
  })
})

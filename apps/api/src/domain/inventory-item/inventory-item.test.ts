import { describe, expect, test } from 'bun:test'
import { generateCategoryId } from '../category/category-id'
import { generateHouseholdId } from '../household/household-id'
import { generateShopId } from '../shop/shop-id'
import { InventoryItem } from './inventory-item'
import { generateInventoryItemId } from './inventory-item-id'

describe('InventoryItem', () => {
  const householdId = generateHouseholdId()

  describe('create', () => {
    test('creates item with all properties', () => {
      const categoryId = generateCategoryId()
      const shopIds = [generateShopId(), generateShopId()]

      const result = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        {
          name: 'Milk',
          description: 'Organic whole milk',
          categoryId,
          targetStock: 2,
          targetStockUnit: 'l',
          basePriceCents: 199,
          basePriceUnit: 'l',
          shopIds,
        },
      )

      expect(result.ok).toBe(true)
      if (!result.ok) return

      const item = result.value
      expect(item.id).toBeDefined()
      expect(item.householdId).toBe(householdId)
      expect(item.name).toBe('Milk')
      expect(item.description).toBe('Organic whole milk')
      expect(item.categoryId).toBe(categoryId)
      expect(item.targetStock).toBe(2)
      expect(item.targetStockUnit).toBe('l')
      expect(item.basePriceCents).toBe(199)
      expect(item.basePriceUnit).toBe('l')
      expect(item.shopIds).toEqual(shopIds)
      expect(item.createdAt).toBeInstanceOf(Date)
      expect(item.updatedAt).toBeNull()
    })

    test.skip('creates item with minimal properties', () => {
      const result = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        // @ts-expect-error
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

    test.skip('returns INVALID_NAME error for empty name', () => {
      const result1 = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        // @ts-expect-error
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
        // @ts-expect-error
        { name: '   ' },
      )
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })
    })

    test.skip('returns INVALID_QUANTITY error for invalid targetStock', () => {
      const result1 = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        // @ts-expect-error
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
        // @ts-expect-error
        {
          name: 'Milk',
          targetStock: 0,
        },
      )
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({ type: 'INVALID_QUANTITY' })
    })

    test.skip('returns INVALID_PRICE error for negative price', () => {
      const result = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        // @ts-expect-error
        {
          name: 'Milk',
          basePriceCents: -1,
        },
      )

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error).toEqual({ type: 'INVALID_PRICE' })
    })

    test.skip('returns INVALID_UNIT error for invalid unit', () => {
      const result1 = InventoryItem.create(
        generateInventoryItemId(),
        householdId,
        // @ts-expect-error
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
        // @ts-expect-error
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
})

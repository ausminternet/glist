import { describe, expect, test } from 'bun:test'
import { InvalidPriceError } from '../shared/price'
import { InvalidQuantityError } from '../shared/quantity'

import { InvalidUnitError } from '@glist/shared'
import { InvalidNameError } from './errors'
import { InventoryItem } from './inventory-item'

describe('InventoryItem', () => {
  const householdId = 'household-123'

  describe('create', () => {
    test('creates item with all properties', () => {
      const item = InventoryItem.create(householdId, {
        name: 'Milk',
        description: 'Organic whole milk',
        categoryId: 'cat-dairy',
        targetStock: 2,
        targetStockUnit: 'l',
        basePriceCents: 199,
        basePriceUnit: 'l',
        shopIds: ['shop-1', 'shop-2'],
      })

      expect(item.id).toBeDefined()
      expect(item.householdId).toBe(householdId)
      expect(item.name).toBe('Milk')
      expect(item.description).toBe('Organic whole milk')
      expect(item.categoryId).toBe('cat-dairy')
      expect(item.targetStock).toBe(2)
      expect(item.targetStockUnit).toBe('l')
      expect(item.basePriceCents).toBe(199)
      expect(item.basePriceUnit).toBe('l')
      expect(item.shopIds).toEqual(['shop-1', 'shop-2'])
      expect(item.createdAt).toBeInstanceOf(Date)
      expect(item.updatedAt).toBeNull()
    })

    test('creates item with minimal properties', () => {
      const item = InventoryItem.create(householdId, { name: 'Bread' })

      expect(item.name).toBe('Bread')
      expect(item.description).toBeNull()
      expect(item.categoryId).toBeNull()
      expect(item.targetStock).toBeNull()
      expect(item.targetStockUnit).toBeNull()
      expect(item.basePriceCents).toBeNull()
      expect(item.basePriceUnit).toBeNull()
      expect(item.shopIds).toEqual([])
    })

    test('throws InvalidNameError for empty name', () => {
      expect(() => InventoryItem.create(householdId, { name: '' })).toThrow(
        InvalidNameError,
      )
      expect(() => InventoryItem.create(householdId, { name: '   ' })).toThrow(
        InvalidNameError,
      )
    })

    test('throws InvalidQuantityError for invalid targetStock', () => {
      expect(() =>
        InventoryItem.create(householdId, { name: 'Milk', targetStock: -1 }),
      ).toThrow(InvalidQuantityError)
      expect(() =>
        InventoryItem.create(householdId, { name: 'Milk', targetStock: 0 }),
      ).toThrow(InvalidQuantityError)
    })

    test('throws InvalidPriceError for negative price', () => {
      expect(() =>
        InventoryItem.create(householdId, { name: 'Milk', basePriceCents: -1 }),
      ).toThrow(InvalidPriceError)
    })

    test('throws InvalidUnitError for invalid unit', () => {
      expect(() =>
        InventoryItem.create(householdId, {
          name: 'Milk',
          targetStock: 1,
          targetStockUnit: 'liters',
        }),
      ).toThrow(InvalidUnitError)
      expect(() =>
        InventoryItem.create(householdId, {
          name: 'Milk',
          basePriceCents: 100,
          basePriceUnit: 'euros',
        }),
      ).toThrow(InvalidUnitError)
    })
  })

  describe('reconstitute', () => {
    test('restores item from database', () => {
      const createdAt = new Date('2024-01-01')
      const updatedAt = new Date('2024-01-02')

      const item = InventoryItem.reconstitute({
        id: 'item-456',
        householdId: 'household-789',
        name: 'Butter',
        description: 'Irish butter',
        categoryId: 'cat-dairy',
        targetStock: 500,
        targetStockUnit: 'g',
        basePriceCents: 349,
        basePriceUnit: 'pack',
        shopIds: ['shop-1'],
        createdAt,
        updatedAt,
      })

      expect(item.id).toBe('item-456')
      expect(item.householdId).toBe('household-789')
      expect(item.name).toBe('Butter')
      expect(item.targetStock).toBe(500)
      expect(item.targetStockUnit).toBe('g')
      expect(item.basePriceCents).toBe(349)
      expect(item.basePriceUnit).toBe('pack')
      expect(item.createdAt).toBe(createdAt)
      expect(item.updatedAt).toBe(updatedAt)
    })
  })

  describe('mutations', () => {
    test('changeName updates name and updatedAt', () => {
      const item = InventoryItem.create(householdId, { name: 'Milk' })
      expect(item.updatedAt).toBeNull()

      item.changeName('Whole Milk')

      expect(item.name).toBe('Whole Milk')
      expect(item.updatedAt).toBeInstanceOf(Date)
    })

    test('changeName throws InvalidNameError for empty name', () => {
      const item = InventoryItem.create(householdId, { name: 'Milk' })

      expect(() => item.changeName('')).toThrow(InvalidNameError)
      expect(() => item.changeName('   ')).toThrow(InvalidNameError)
    })

    test('changeTargetStock validates quantity', () => {
      const item = InventoryItem.create(householdId, { name: 'Milk' })

      expect(() => item.changeTargetStock(-1, 'l')).toThrow(
        InvalidQuantityError,
      )
      expect(() => item.changeTargetStock(1, 'invalid')).toThrow(
        InvalidUnitError,
      )
    })

    test('changeBasePrice validates price', () => {
      const item = InventoryItem.create(householdId, { name: 'Milk' })

      expect(() => item.changeBasePrice(-100, 'l')).toThrow(InvalidPriceError)
      expect(() => item.changeBasePrice(100, 'invalid')).toThrow(
        InvalidUnitError,
      )
    })
  })

  describe('toSnapshot', () => {
    test('creates snapshot with all data', () => {
      const item = InventoryItem.create(householdId, {
        name: 'Milk',
        description: 'Organic',
        categoryId: 'cat-dairy',
        targetStock: 2,
        targetStockUnit: 'l',
        basePriceCents: 199,
        basePriceUnit: 'l',
        shopIds: ['shop-1'],
      })

      const snapshot = item.toSnapshot()

      expect(snapshot).toEqual({
        id: item.id,
        householdId,
        name: 'Milk',
        description: 'Organic',
        categoryId: 'cat-dairy',
        targetStock: 2,
        targetStockUnit: 'l',
        basePriceCents: 199,
        basePriceUnit: 'l',
        shopIds: ['shop-1'],
        createdAt: expect.any(Date),
        updatedAt: null,
      })
    })
  })
})

import { describe, expect, test } from 'bun:test'
import { parseHouseholdId } from '../household/household-id'
import { Shop } from './shop'
import { generateShopId } from './shop-id'

describe('Shop', () => {
  const householdId = parseHouseholdId('00000000-0000-0000-0000-000000000123')

  describe('create', () => {
    test('creates shop with name', () => {
      const result = Shop.create(generateShopId(), householdId, {
        name: 'Rewe',
      })

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.name).toBe('Rewe')
      expect(result.value.householdId).toBe(householdId)
      expect(result.value.sortOrder).toBe(1000.0)
      expect(result.value.createdAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeNull()
    })

    test('creates shop with custom sortOrder', () => {
      const result = Shop.create(generateShopId(), householdId, {
        name: 'Aldi',
        sortOrder: 5,
      })

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.sortOrder).toBe(5)
    })

    test('returns INVALID_NAME error for empty name', () => {
      const result = Shop.create(generateShopId(), householdId, {
        name: '',
      })

      expect(result.ok).toBe(false)
      if (result.ok) return

      expect(result.error.type).toBe('INVALID_NAME')
    })

    test('returns INVALID_NAME error for whitespace-only name', () => {
      const result = Shop.create(generateShopId(), householdId, {
        name: '   ',
      })

      expect(result.ok).toBe(false)
      if (result.ok) return

      expect(result.error.type).toBe('INVALID_NAME')
    })
  })

  describe('changeName', () => {
    test('updates name and updatedAt', () => {
      const result = Shop.create(generateShopId(), householdId, {
        name: 'Rewe',
      })
      if (!result.ok) throw new Error('Failed to create shop')

      const shop = result.value
      const originalUpdatedAt = shop.updatedAt

      const changeResult = shop.changeName('Edeka')

      expect(changeResult.ok).toBe(true)
      expect(shop.name).toBe('Edeka')
      expect(shop.updatedAt).not.toBe(originalUpdatedAt)
      expect(shop.updatedAt).toBeInstanceOf(Date)
    })

    test('returns INVALID_NAME error for empty name', () => {
      const result = Shop.create(generateShopId(), householdId, {
        name: 'Rewe',
      })
      if (!result.ok) throw new Error('Failed to create shop')

      const shop = result.value
      const changeResult = shop.changeName('')

      expect(changeResult.ok).toBe(false)
      if (changeResult.ok) return

      expect(changeResult.error.type).toBe('INVALID_NAME')
      expect(shop.name).toBe('Rewe') // unchanged
    })
  })

  describe('changeSortOrder', () => {
    test('updates sortOrder and updatedAt', () => {
      const result = Shop.create(generateShopId(), householdId, {
        name: 'Rewe',
      })
      if (!result.ok) throw new Error('Failed to create shop')

      const shop = result.value
      const changeResult = shop.changeSortOrder(42)

      expect(changeResult.ok).toBe(true)
      expect(shop.sortOrder).toBe(42)
      expect(shop.updatedAt).toBeInstanceOf(Date)
    })

    test('accepts zero as valid sortOrder', () => {
      const result = Shop.create(generateShopId(), householdId, {
        name: 'Rewe',
      })
      if (!result.ok) throw new Error('Failed to create shop')

      const shop = result.value
      const changeResult = shop.changeSortOrder(0)

      expect(changeResult.ok).toBe(true)
      expect(shop.sortOrder).toBe(0)
    })

    test('returns INVALID_SORT_ORDER error for negative value', () => {
      const result = Shop.create(generateShopId(), householdId, {
        name: 'Rewe',
      })
      if (!result.ok) throw new Error('Failed to create shop')

      const shop = result.value
      const originalSortOrder = shop.sortOrder
      const changeResult = shop.changeSortOrder(-1)

      expect(changeResult.ok).toBe(false)
      if (changeResult.ok) return

      expect(changeResult.error.type).toBe('INVALID_SORT_ORDER')
      expect(shop.sortOrder).toBe(originalSortOrder) // unchanged
    })
  })
})

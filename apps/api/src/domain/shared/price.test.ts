import { describe, expect, test } from 'bun:test'
import { Price } from './price'

describe('Price', () => {
  describe('create', () => {
    test('creates price with cents and unit', () => {
      const result = Price.create(199, 'kg')

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.cents).toBe(199)
      expect(result.value.unit).toBe('kg')
    })

    test('creates price with cents only', () => {
      const result = Price.create(500, null)

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.cents).toBe(500)
      expect(result.value.unit).toBeNull()
    })

    test('creates empty price with null/null', () => {
      const result = Price.create(null, null)

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.cents).toBeNull()
      expect(result.value.unit).toBeNull()
    })

    test('returns INVALID_PRICE error for zero or negative price', () => {
      const result1 = Price.create(0, 'piece')
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({ type: 'INVALID_PRICE' })

      const result2 = Price.create(-1, 'kg')
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({ type: 'INVALID_PRICE' })

      const result3 = Price.create(-100, null)
      expect(result3.ok).toBe(false)
      if (result3.ok) return
      expect(result3.error).toEqual({ type: 'INVALID_PRICE' })
    })

    test('returns PRICE_UNIT_WITHOUT_VALUE error when unit provided without price', () => {
      const result = Price.create(null, 'kg')

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error).toEqual({ type: 'PRICE_UNIT_WITHOUT_VALUE' })
    })

    test('returns INVALID_UNIT error for invalid unit', () => {
      const result1 = Price.create(100, 'euros')
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({ type: 'INVALID_UNIT', unit: 'euros' })

      const result2 = Price.create(100, 'invalid')
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({ type: 'INVALID_UNIT', unit: 'invalid' })
    })

    test('accepts all valid unit types', () => {
      const units = [
        'piece',
        'kg',
        'g',
        'l',
        'ml',
        'can',
        'bottle',
        'pack',
      ] as const

      for (const unit of units) {
        const result = Price.create(100, unit)
        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.value.unit).toBe(unit)
      }
    })
  })

  describe('empty', () => {
    test('creates empty price', () => {
      const price = Price.empty()

      expect(price.cents).toBeNull()
      expect(price.unit).toBeNull()
    })
  })
})

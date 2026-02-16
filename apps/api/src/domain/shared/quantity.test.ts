import { describe, expect, test } from 'bun:test'
import { Quantity } from './quantity'

describe('Quantity', () => {
  describe('create', () => {
    test('creates quantity with value and unit', () => {
      const result = Quantity.create(5, 'kg')

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.value).toBe(5)
      expect(result.value.unit).toBe('kg')
    })

    test('creates quantity with value only', () => {
      const result = Quantity.create(3, null)

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.value).toBe(3)
      expect(result.value.unit).toBeNull()
    })

    test('creates empty quantity with null/null', () => {
      const result = Quantity.create(null, null)

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.value).toBeNull()
      expect(result.value.unit).toBeNull()
    })

    test('returns INVALID_QUANTITY error for value 0', () => {
      const result = Quantity.create(0, 'kg')

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error).toEqual({ type: 'INVALID_QUANTITY' })
    })

    test('returns INVALID_QUANTITY error for negative value', () => {
      const result1 = Quantity.create(-1, 'kg')
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({ type: 'INVALID_QUANTITY' })

      const result2 = Quantity.create(-0.5, null)
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({ type: 'INVALID_QUANTITY' })
    })

    test('returns UNIT_WITHOUT_VALUE error when unit provided without value', () => {
      const result = Quantity.create(null, 'kg')

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error).toEqual({ type: 'UNIT_WITHOUT_VALUE' })
    })

    test('returns INVALID_UNIT error for invalid unit', () => {
      const result = Quantity.create(5, 'cats')

      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.error).toEqual({ type: 'INVALID_UNIT', unit: 'cats' })
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
        const result = Quantity.create(5, unit)
        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.value.unit).toBe(unit)
      }
    })
  })

  describe('empty', () => {
    test('creates empty quantity', () => {
      const quantity = Quantity.empty()

      expect(quantity.value).toBeNull()
      expect(quantity.unit).toBeNull()
    })
  })
})

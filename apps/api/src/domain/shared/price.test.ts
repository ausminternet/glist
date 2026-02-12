import { InvalidUnitError } from '@glist/shared'
import { describe, expect, test } from 'bun:test'
import { InvalidPriceError, Price, UnitWithoutValueError } from './price'

describe('Price', () => {
  describe('create', () => {
    test('creates price with cents and unit', () => {
      const price = Price.create(199, 'kg')

      expect(price.cents).toBe(199)
      expect(price.unit).toBe('kg')
    })

    test('creates price with cents only', () => {
      const price = Price.create(500, null)

      expect(price.cents).toBe(500)
      expect(price.unit).toBeNull()
    })

    test('creates empty price with null/null', () => {
      const price = Price.create(null, null)

      expect(price.cents).toBeNull()
      expect(price.unit).toBeNull()
    })

    test('throws InvalidPriceError for zero or negative price', () => {
      expect(() => Price.create(0, 'piece')).toThrow(InvalidPriceError)
      expect(() => Price.create(-1, 'kg')).toThrow(InvalidPriceError)
      expect(() => Price.create(-100, null)).toThrow(InvalidPriceError)
    })

    test('throws UnitWithoutValueError when unit provided without price', () => {
      expect(() => Price.create(null, 'kg')).toThrow(UnitWithoutValueError)
    })

    test('throws InvalidUnitError for invalid unit', () => {
      expect(() => Price.create(100, 'euros')).toThrow(InvalidUnitError)
      expect(() => Price.create(100, 'invalid')).toThrow(InvalidUnitError)
    })

    test('accepts all valid unit types', () => {
      expect(Price.create(100, 'piece').unit).toBe('piece')
      expect(Price.create(100, 'kg').unit).toBe('kg')
      expect(Price.create(100, 'g').unit).toBe('g')
      expect(Price.create(100, 'l').unit).toBe('l')
      expect(Price.create(100, 'ml').unit).toBe('ml')
      expect(Price.create(100, 'can').unit).toBe('can')
      expect(Price.create(100, 'bottle').unit).toBe('bottle')
      expect(Price.create(100, 'pack').unit).toBe('pack')
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

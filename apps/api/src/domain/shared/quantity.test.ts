import { InvalidUnitError } from '@glist/shared'
import { describe, expect, test } from 'bun:test'
import {
  InvalidQuantityError,
  Quantity,
  UnitWithoutValueError,
} from './quantity'

describe('Quantity', () => {
  describe('create', () => {
    test('creates quantity with value and unit', () => {
      const quantity = Quantity.create(5, 'kg')

      expect(quantity.value).toBe(5)
      expect(quantity.unit).toBe('kg')
    })

    test('creates quantity with value only', () => {
      const quantity = Quantity.create(3, null)

      expect(quantity.value).toBe(3)
      expect(quantity.unit).toBeNull()
    })

    test('creates empty quantity with null/null', () => {
      const quantity = Quantity.create(null, null)

      expect(quantity.value).toBeNull()
      expect(quantity.unit).toBeNull()
    })

    test('throws InvalidQuantityError for value 0', () => {
      expect(() => Quantity.create(0, 'kg')).toThrow(InvalidQuantityError)
    })

    test('throws InvalidQuantityError for negative value', () => {
      expect(() => Quantity.create(-1, 'kg')).toThrow(InvalidQuantityError)
      expect(() => Quantity.create(-0.5, null)).toThrow(InvalidQuantityError)
    })

    test('throws UnitWithoutValueError when unit provided without value', () => {
      expect(() => Quantity.create(null, 'kg')).toThrow(UnitWithoutValueError)
    })

    test('throws InvalidUnitError for invalid unit', () => {
      expect(() => Quantity.create(5, 'cats')).toThrow(InvalidUnitError)
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

import { describe, expect, it } from 'bun:test'
import { centsToEuro, euroToCents, formatEuroCents } from './currency'

describe('currency utils', () => {
  describe('centsToEuro', () => {
    it('converts cents to euro', () => {
      expect(centsToEuro(123456)).toBe(1234.56)
    })

    it('returns undefined for null', () => {
      expect(centsToEuro(null)).toBeUndefined()
    })

    it('returns undefined for undefined', () => {
      expect(centsToEuro(undefined)).toBeUndefined()
    })
  })

  describe('euroToCents', () => {
    it('converts euro to cents with rounding', () => {
      expect(euroToCents(12.345)).toBe(1235)
    })

    it('handles exact values', () => {
      expect(euroToCents(12.34)).toBe(1234)
    })

    it('returns undefined for null', () => {
      expect(euroToCents(null)).toBeUndefined()
    })
  })

  describe('formatEuroCents', () => {
    it('should format currency correctly', () => {
      expect(formatEuroCents(123456)).toBe('1.234,56\u00A0€')
      expect(formatEuroCents(0)).toBe('0,00\u00A0€')
      expect(formatEuroCents(-98765)).toBe('-987,65\u00A0€')
    })
  })
})

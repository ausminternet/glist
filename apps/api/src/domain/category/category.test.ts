import { describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import { Category } from './category'
import { generateCategoryId } from './category-id'

describe('Category', () => {
  const householdId = generateHouseholdId()

  describe('create', () => {
    test('creates category with name', () => {
      const result = Category.create(generateCategoryId(), householdId, {
        name: 'Dairy',
      })

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.name).toBe('Dairy')
      expect(result.value.householdId).toBe(householdId)
      expect(result.value.sortOrder).toBe(1000.0)
      expect(result.value.createdAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeNull()
    })

    test('creates category with custom sortOrder', () => {
      const result = Category.create(generateCategoryId(), householdId, {
        name: 'Beverages',
        sortOrder: 5,
      })

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.sortOrder).toBe(5)
    })

    test('returns INVALID_NAME error for empty name', () => {
      const result = Category.create(generateCategoryId(), householdId, {
        name: '',
      })

      expect(result.ok).toBe(false)
      if (result.ok) return

      expect(result.error.type).toBe('INVALID_NAME')
    })

    test('returns INVALID_NAME error for whitespace-only name', () => {
      const result = Category.create(generateCategoryId(), householdId, {
        name: '   ',
      })

      expect(result.ok).toBe(false)
      if (result.ok) return

      expect(result.error.type).toBe('INVALID_NAME')
    })
  })

  describe('changeName', () => {
    test('updates name and updatedAt', () => {
      const result = Category.create(generateCategoryId(), householdId, {
        name: 'Dairy',
      })
      if (!result.ok) throw new Error('Failed to create category')

      const category = result.value
      const originalUpdatedAt = category.updatedAt

      const changeResult = category.changeName('Frozen Foods')

      expect(changeResult.ok).toBe(true)
      expect(category.name).toBe('Frozen Foods')
      expect(category.updatedAt).not.toBe(originalUpdatedAt)
      expect(category.updatedAt).toBeInstanceOf(Date)
    })

    test('returns INVALID_NAME error for empty name', () => {
      const result = Category.create(generateCategoryId(), householdId, {
        name: 'Dairy',
      })
      if (!result.ok) throw new Error('Failed to create category')

      const category = result.value
      const changeResult = category.changeName('')

      expect(changeResult.ok).toBe(false)
      if (changeResult.ok) return

      expect(changeResult.error.type).toBe('INVALID_NAME')
      expect(category.name).toBe('Dairy') // unchanged
    })
  })

  describe('changeSortOrder', () => {
    test('updates sortOrder and updatedAt', () => {
      const result = Category.create(generateCategoryId(), householdId, {
        name: 'Dairy',
      })
      if (!result.ok) throw new Error('Failed to create category')

      const category = result.value
      const changeResult = category.changeSortOrder(42)

      expect(changeResult.ok).toBe(true)
      expect(category.sortOrder).toBe(42)
      expect(category.updatedAt).toBeInstanceOf(Date)
    })

    test('accepts zero as valid sortOrder', () => {
      const result = Category.create(generateCategoryId(), householdId, {
        name: 'Dairy',
      })
      if (!result.ok) throw new Error('Failed to create category')

      const category = result.value
      const changeResult = category.changeSortOrder(0)

      expect(changeResult.ok).toBe(true)
      expect(category.sortOrder).toBe(0)
    })

    test('returns INVALID_SORT_ORDER error for negative value', () => {
      const result = Category.create(generateCategoryId(), householdId, {
        name: 'Dairy',
      })
      if (!result.ok) throw new Error('Failed to create category')

      const category = result.value
      const originalSortOrder = category.sortOrder
      const changeResult = category.changeSortOrder(-1)

      expect(changeResult.ok).toBe(false)
      if (changeResult.ok) return

      expect(changeResult.error.type).toBe('INVALID_SORT_ORDER')
      expect(category.sortOrder).toBe(originalSortOrder) // unchanged
    })
  })
})

import { describe, expect, test } from 'bun:test'
import { parseHouseholdId } from '../shared/household-id'
import { ShoppingList } from './shopping-list'
import { generateShoppingListId } from './shopping-list-id'

describe('ShoppingList', () => {
  const householdId = parseHouseholdId('00000000-0000-0000-0000-000000000123')

  describe('create', () => {
    test('creates list with name', () => {
      const result = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )

      expect(result.ok).toBe(true)
      if (!result.ok) return

      const list = result.value
      expect(list.id).toBeDefined()
      expect(list.householdId).toBe(householdId)
      expect(list.name).toBe('Weekly Shopping')
      expect(list.createdAt).toBeInstanceOf(Date)
      expect(list.updatedAt).toBeNull()
    })

    test('returns INVALID_NAME error for empty name', () => {
      const result1 = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        '',
      )
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })

      const result2 = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        '   ',
      )
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })
    })
  })

  describe('changeName', () => {
    test('updates name and updatedAt', () => {
      const createResult = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const list = createResult.value
      const result = list.changeName('Monthly Shopping')

      expect(result.ok).toBe(true)
      expect(list.name).toBe('Monthly Shopping')
      expect(list.updatedAt).toBeInstanceOf(Date)
    })

    test('returns INVALID_NAME error for empty name', () => {
      const createResult = ShoppingList.create(
        generateShoppingListId(),
        householdId,
        'Weekly Shopping',
      )
      expect(createResult.ok).toBe(true)
      if (!createResult.ok) return

      const list = createResult.value

      const result1 = list.changeName('')
      expect(result1.ok).toBe(false)
      if (result1.ok) return
      expect(result1.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })

      const result2 = list.changeName('   ')
      expect(result2.ok).toBe(false)
      if (result2.ok) return
      expect(result2.error).toEqual({
        type: 'INVALID_NAME',
        reason: 'Name cannot be empty',
      })
    })
  })
})

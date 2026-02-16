import { describe, expect, test } from 'bun:test'
import { Household } from './household'
import { generateHouseholdId } from './household-id'

describe('Household', () => {
  describe('create', () => {
    test('creates household with name', () => {
      const id = generateHouseholdId()
      const result = Household.create(id, { name: 'My Household' })

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.value.id).toBe(id)
      expect(result.value.name).toBe('My Household')
      expect(result.value.createdAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeNull()
    })

    test('returns INVALID_NAME error for blank name', () => {
      const result = Household.create(generateHouseholdId(), { name: '   ' })

      expect(result.ok).toBe(false)
      if (result.ok) return

      expect(result.error.type).toBe('INVALID_NAME')
    })
  })

  describe('changeName', () => {
    test('updates name and updatedAt', () => {
      const result = Household.create(generateHouseholdId(), {
        name: 'Old Name',
      })
      if (!result.ok) throw new Error('Failed to create household')

      const household = result.value

      const changeResult = household.changeName('New Name')

      expect(changeResult.ok).toBe(true)
      expect(household.name).toBe('New Name')
      expect(household.updatedAt).toBeInstanceOf(Date)
    })

    test('returns INVALID_NAME error for blank name', () => {
      const result = Household.create(generateHouseholdId(), {
        name: 'My Household',
      })
      if (!result.ok) throw new Error('Failed to create household')

      const household = result.value
      const changeResult = household.changeName('')

      expect(changeResult.ok).toBe(false)
      if (changeResult.ok) return

      expect(changeResult.error.type).toBe('INVALID_NAME')
      expect(household.name).toBe('My Household')
    })
  })
})

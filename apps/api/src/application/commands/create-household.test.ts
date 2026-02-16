import { beforeEach, describe, expect, test } from 'bun:test'
import type { CategoryRepository } from '@/domain/category/category-repository'
import type { HouseholdRepository } from '@/domain/household/household-repository'
import type { ShopRepository } from '@/domain/shop/shop-repository'
import {
  createMockCategoryRepository,
  createMockHouseholdRepository,
  createMockShopRepository,
} from '@/test'
import { CreateHouseholdCommandHandler } from './create-household'

describe('CreateHouseholdCommandHandler', () => {
  let householdRepository: HouseholdRepository
  let shopRepository: ShopRepository
  let categoryRepository: CategoryRepository
  let handler: CreateHouseholdCommandHandler

  beforeEach(() => {
    householdRepository = createMockHouseholdRepository()
    shopRepository = createMockShopRepository()
    categoryRepository = createMockCategoryRepository()
    handler = new CreateHouseholdCommandHandler(
      householdRepository,
      shopRepository,
      categoryRepository,
    )
  })

  test('creates household with default shops and categories', async () => {
    const result = await handler.execute({ name: 'My Household' })

    expect(result.ok).toBe(true)
    expect(householdRepository.save).toHaveBeenCalledTimes(1)
    expect(shopRepository.saveMany).toHaveBeenCalledTimes(1)
    expect(categoryRepository.saveMany).toHaveBeenCalledTimes(1)
  })

  test('returns INVALID_NAME error for blank name', async () => {
    const result = await handler.execute({ name: '   ' })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVALID_NAME')
    expect(householdRepository.save).not.toHaveBeenCalled()
  })

  test('creates custom shops and categories', async () => {
    await handler.execute({
      name: 'My Household',
      shopNames: ['Aldi', 'Lidl'],
      categoryNames: ['Obst', 'Gemüse'],
    })

    expect(shopRepository.saveMany).toHaveBeenCalledTimes(1)
    expect(categoryRepository.saveMany).toHaveBeenCalledTimes(1)
  })

  test('skips saving when empty arrays provided', async () => {
    await handler.execute({
      name: 'My Household',
      shopNames: [],
      categoryNames: [],
    })

    expect(shopRepository.saveMany).not.toHaveBeenCalled()
    expect(categoryRepository.saveMany).not.toHaveBeenCalled()
  })
})

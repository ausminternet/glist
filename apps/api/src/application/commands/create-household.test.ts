import { describe, expect, test } from 'bun:test'
import type { Category } from '@/domain/category/category'
import type { Shop } from '@/domain/shop/shop'
import {
  createMockCategoryRepository,
  createMockHouseholdRepository,
  createMockShopRepository,
} from '@/test'
import { CreateHouseholdCommandHandler } from './create-household'

function createHandler() {
  const householdRepository = createMockHouseholdRepository()
  const shopRepository = createMockShopRepository()
  const categoryRepository = createMockCategoryRepository()

  const handler = new CreateHouseholdCommandHandler(
    householdRepository,
    shopRepository,
    categoryRepository,
  )

  const getSavedShops = () =>
    (shopRepository.saveMany as ReturnType<typeof import('bun:test').mock>).mock
      .calls[0]?.[0] as Shop[] | undefined

  const getSavedCategories = () =>
    (categoryRepository.saveMany as ReturnType<typeof import('bun:test').mock>)
      .mock.calls[0]?.[0] as Category[] | undefined

  return { handler, householdRepository, getSavedShops, getSavedCategories }
}

describe('CreateHouseholdCommandHandler', () => {
  test('creates household with default shops and categories', async () => {
    const { handler, householdRepository, getSavedShops, getSavedCategories } =
      createHandler()

    const result = await handler.execute({ name: 'My Household' })

    expect(result.ok).toBe(true)
    expect(householdRepository.save).toHaveBeenCalledTimes(1)
    expect(getSavedShops()?.length).toBe(10)
    expect(getSavedCategories()?.length).toBe(14)
  })

  test('returns INVALID_NAME error for blank name', async () => {
    const { handler, householdRepository } = createHandler()

    const result = await handler.execute({ name: '   ' })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVALID_NAME')
    expect(householdRepository.save).not.toHaveBeenCalled()
  })

  test('creates custom shops and categories with correct sortOrder', async () => {
    const { handler, getSavedShops, getSavedCategories } = createHandler()

    const result = await handler.execute({
      name: 'My Household',
      shopNames: ['Aldi', 'Lidl'],
      categoryNames: ['Obst', 'Gemüse', 'Fleisch'],
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const shops = getSavedShops()!
    expect(shops.length).toBe(2)
    expect(shops[0].name).toBe('Aldi')
    expect(shops[0].sortOrder).toBe(0)
    expect(shops[0].householdId).toBe(result.value)
    expect(shops[1].sortOrder).toBe(100)

    const categories = getSavedCategories()!
    expect(categories.length).toBe(3)
    expect(categories[0].name).toBe('Obst')
    expect(categories[2].sortOrder).toBe(200)
    expect(categories[0].householdId).toBe(result.value)
  })

  test('skips saving when empty arrays provided', async () => {
    const { handler, getSavedShops, getSavedCategories } = createHandler()

    await handler.execute({
      name: 'My Household',
      shopNames: [],
      categoryNames: [],
    })

    expect(getSavedShops()).toBeUndefined()
    expect(getSavedCategories()).toBeUndefined()
  })

  test('filters out invalid names', async () => {
    const { handler, getSavedShops, getSavedCategories } = createHandler()

    await handler.execute({
      name: 'My Household',
      shopNames: ['Valid', '', '   '],
      categoryNames: ['Also Valid', ''],
    })

    expect(getSavedShops()?.length).toBe(1)
    expect(getSavedCategories()?.length).toBe(1)
  })
})

import { parseHouseholdId } from '@/domain/shared/household-id'
import { Shop } from '@/domain/shop/shop'
import { generateShopId } from '@/domain/shop/shop-id'
import { ShopRepository } from '@/domain/shop/shop-repository'
import { describe, expect, mock, test } from 'bun:test'
import { ReorderShopsCommandHandler } from './reorder-shops'

const householdId = '00000000-0000-0000-0000-000000000001'

function createTestShop(householdId: string, name: string): Shop {
  const result = Shop.create(generateShopId(), parseHouseholdId(householdId), {
    name,
  })
  if (!result.ok) throw new Error('Failed to create test shop')
  return result.value
}

function createMockRepository(shops: Shop[]): ShopRepository {
  return {
    findById: mock(() => Promise.resolve(null)),
    findAllByHouseholdId: mock(() => Promise.resolve(shops)),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
  }
}

describe('ReorderShopsCommandHandler', () => {
  test('reorders shops successfully', async () => {
    const shop1 = createTestShop(householdId, 'Rewe')
    const shop2 = createTestShop(householdId, 'Aldi')
    const shop3 = createTestShop(householdId, 'Edeka')

    const repository = createMockRepository([shop1, shop2, shop3])
    const handler = new ReorderShopsCommandHandler(repository)

    const result = await handler.execute(
      { ids: [shop3.id, shop1.id, shop2.id] },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(3)
    expect(shop3.sortOrder).toBe(0)
    expect(shop1.sortOrder).toBe(1)
    expect(shop2.sortOrder).toBe(2)
  })

  test('returns SHOP_NOT_FOUND when id does not belong to household', async () => {
    const shop1 = createTestShop(householdId, 'Rewe')
    const shop2 = createTestShop(householdId, 'Aldi')

    const repository = createMockRepository([shop1, shop2])
    const handler = new ReorderShopsCommandHandler(repository)

    const result = await handler.execute(
      { ids: [shop1.id, shop2.id, 'non-existent-id'] },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.type).toBe('SHOP_NOT_FOUND')
    expect(result.error.id).toBe('non-existent-id')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns SHOP_IDS_MISMATCH when not all shops are included', async () => {
    const shop1 = createTestShop(householdId, 'Rewe')
    const shop2 = createTestShop(householdId, 'Aldi')
    const shop3 = createTestShop(householdId, 'Edeka')

    const repository = createMockRepository([shop1, shop2, shop3])
    const handler = new ReorderShopsCommandHandler(repository)

    const result = await handler.execute(
      { ids: [shop1.id, shop2.id] }, // missing shop3
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.type).toBe('SHOP_IDS_MISMATCH')
    expect(result.error.reason).toContain('Expected 3')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns SHOP_IDS_MISMATCH when duplicate ids provided', async () => {
    const shop1 = createTestShop(householdId, 'Rewe')
    const shop2 = createTestShop(householdId, 'Aldi')

    const repository = createMockRepository([shop1, shop2])
    const handler = new ReorderShopsCommandHandler(repository)

    const result = await handler.execute(
      { ids: [shop1.id, shop1.id] }, // duplicate
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.type).toBe('SHOP_IDS_MISMATCH')
    expect(result.error.reason).toContain('Duplicate')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('works with single shop', async () => {
    const shop = createTestShop(householdId, 'Rewe')

    const repository = createMockRepository([shop])
    const handler = new ReorderShopsCommandHandler(repository)

    const result = await handler.execute({ ids: [shop.id] }, { householdId })

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(shop.sortOrder).toBe(0)
  })
})

import { describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import { createMockShopRepository, createTestShop } from '@/test'
import { ReorderShopsCommandHandler } from './reorder-shops'

const householdId = generateHouseholdId()

describe('ReorderShopsCommandHandler', () => {
  test('reorders shops successfully', async () => {
    const shop1 = createTestShop({ householdId, name: 'Rewe' })
    const shop2 = createTestShop({ householdId, name: 'Aldi' })
    const shop3 = createTestShop({ householdId, name: 'Edeka' })

    const repository = createMockShopRepository([shop1, shop2, shop3])
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
    const shop1 = createTestShop({ householdId, name: 'Rewe' })
    const shop2 = createTestShop({ householdId, name: 'Aldi' })

    const repository = createMockShopRepository([shop1, shop2])
    const handler = new ReorderShopsCommandHandler(repository)

    const result = await handler.execute(
      { ids: [shop1.id, shop2.id, 'non-existent-id'] },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.type).toBe('SHOP_NOT_FOUND')
    if (result.error.type !== 'SHOP_NOT_FOUND') return
    expect(result.error.id).toBe('non-existent-id')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns SHOP_IDS_MISMATCH when not all shops are included', async () => {
    const shop1 = createTestShop({ householdId, name: 'Rewe' })
    const shop2 = createTestShop({ householdId, name: 'Aldi' })
    const shop3 = createTestShop({ householdId, name: 'Edeka' })

    const repository = createMockShopRepository([shop1, shop2, shop3])
    const handler = new ReorderShopsCommandHandler(repository)

    const result = await handler.execute(
      { ids: [shop1.id, shop2.id] }, // missing shop3
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.type).toBe('SHOP_IDS_MISMATCH')
    if (result.error.type !== 'SHOP_IDS_MISMATCH') return
    expect(result.error.reason).toContain('Expected 3')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns SHOP_IDS_MISMATCH when duplicate ids provided', async () => {
    const shop1 = createTestShop({ householdId, name: 'Rewe' })
    const shop2 = createTestShop({ householdId, name: 'Aldi' })

    const repository = createMockShopRepository([shop1, shop2])
    const handler = new ReorderShopsCommandHandler(repository)

    const result = await handler.execute(
      { ids: [shop1.id, shop1.id] }, // duplicate
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.type).toBe('SHOP_IDS_MISMATCH')
    if (result.error.type !== 'SHOP_IDS_MISMATCH') return
    expect(result.error.reason).toContain('Duplicate')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('works with single shop', async () => {
    const shop = createTestShop({ householdId, name: 'Rewe' })

    const repository = createMockShopRepository([shop])
    const handler = new ReorderShopsCommandHandler(repository)

    const result = await handler.execute({ ids: [shop.id] }, { householdId })

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(shop.sortOrder).toBe(0)
  })
})

import { describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import { createMockCategoryRepository, createTestCategory } from '@/test'
import { ReorderCategoriesCommandHandler } from './reorder-categories'

const householdId = generateHouseholdId()

describe('ReorderCategoriesCommandHandler', () => {
  test('reorders categories successfully', async () => {
    const category1 = createTestCategory({ householdId, name: 'Dairy' })
    const category2 = createTestCategory({ householdId, name: 'Vegetables' })
    const category3 = createTestCategory({ householdId, name: 'Meat' })

    const repository = createMockCategoryRepository([
      category1,
      category2,
      category3,
    ])
    const handler = new ReorderCategoriesCommandHandler(repository)

    const result = await handler.execute(
      { ids: [category3.id, category1.id, category2.id] },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(3)
    expect(category3.sortOrder).toBe(0)
    expect(category1.sortOrder).toBe(1)
    expect(category2.sortOrder).toBe(2)
  })

  test('returns CATEGORY_NOT_FOUND when id does not belong to household', async () => {
    const category1 = createTestCategory({ householdId, name: 'Dairy' })
    const category2 = createTestCategory({ householdId, name: 'Vegetables' })

    const repository = createMockCategoryRepository([category1, category2])
    const handler = new ReorderCategoriesCommandHandler(repository)

    const result = await handler.execute(
      { ids: [category1.id, category2.id, 'non-existent-id'] },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.type).toBe('CATEGORY_NOT_FOUND')
    if (result.error.type !== 'CATEGORY_NOT_FOUND') return
    expect(result.error.id).toBe('non-existent-id')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns CATEGORY_IDS_MISMATCH when not all categories are included', async () => {
    const category1 = createTestCategory({ householdId, name: 'Dairy' })
    const category2 = createTestCategory({ householdId, name: 'Vegetables' })
    const category3 = createTestCategory({ householdId, name: 'Meat' })

    const repository = createMockCategoryRepository([
      category1,
      category2,
      category3,
    ])
    const handler = new ReorderCategoriesCommandHandler(repository)

    const result = await handler.execute(
      { ids: [category1.id, category2.id] }, // missing category3
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.type).toBe('CATEGORY_IDS_MISMATCH')
    if (result.error.type !== 'CATEGORY_IDS_MISMATCH') return
    expect(result.error.reason).toContain('Expected 3')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns CATEGORY_IDS_MISMATCH when duplicate ids provided', async () => {
    const category1 = createTestCategory({ householdId, name: 'Dairy' })
    const category2 = createTestCategory({ householdId, name: 'Vegetables' })

    const repository = createMockCategoryRepository([category1, category2])
    const handler = new ReorderCategoriesCommandHandler(repository)

    const result = await handler.execute(
      { ids: [category1.id, category1.id] }, // duplicate
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.type).toBe('CATEGORY_IDS_MISMATCH')
    if (result.error.type !== 'CATEGORY_IDS_MISMATCH') return
    expect(result.error.reason).toContain('Duplicate')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('works with single category', async () => {
    const category = createTestCategory({ householdId, name: 'Dairy' })

    const repository = createMockCategoryRepository([category])
    const handler = new ReorderCategoriesCommandHandler(repository)

    const result = await handler.execute(
      { ids: [category.id] },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(category.sortOrder).toBe(0)
  })
})

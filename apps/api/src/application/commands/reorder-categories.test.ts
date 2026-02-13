import { Category } from '@/domain/category/category'
import { generateCategoryId } from '@/domain/category/category-id'
import { CategoryRepository } from '@/domain/category/category-repository'
import { parseHouseholdId } from '@/domain/shared/household-id'
import { describe, expect, mock, test } from 'bun:test'
import { ReorderCategoriesCommandHandler } from './reorder-categories'

const householdId = '00000000-0000-0000-0000-000000000001'

function createTestCategory(householdId: string, name: string): Category {
  const result = Category.create(
    generateCategoryId(),
    parseHouseholdId(householdId),
    { name },
  )
  if (!result.ok) throw new Error('Failed to create test category')
  return result.value
}

function createMockRepository(categories: Category[]): CategoryRepository {
  return {
    findById: mock(() => Promise.resolve(null)),
    findAllByHouseholdId: mock(() => Promise.resolve(categories)),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
  }
}

describe('ReorderCategoriesCommandHandler', () => {
  test('reorders categories successfully', async () => {
    const category1 = createTestCategory(householdId, 'Dairy')
    const category2 = createTestCategory(householdId, 'Vegetables')
    const category3 = createTestCategory(householdId, 'Meat')

    const repository = createMockRepository([category1, category2, category3])
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
    const category1 = createTestCategory(householdId, 'Dairy')
    const category2 = createTestCategory(householdId, 'Vegetables')

    const repository = createMockRepository([category1, category2])
    const handler = new ReorderCategoriesCommandHandler(repository)

    const result = await handler.execute(
      { ids: [category1.id, category2.id, 'non-existent-id'] },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.type).toBe('CATEGORY_NOT_FOUND')
    expect(result.error.id).toBe('non-existent-id')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns CATEGORY_IDS_MISMATCH when not all categories are included', async () => {
    const category1 = createTestCategory(householdId, 'Dairy')
    const category2 = createTestCategory(householdId, 'Vegetables')
    const category3 = createTestCategory(householdId, 'Meat')

    const repository = createMockRepository([category1, category2, category3])
    const handler = new ReorderCategoriesCommandHandler(repository)

    const result = await handler.execute(
      { ids: [category1.id, category2.id] }, // missing category3
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.type).toBe('CATEGORY_IDS_MISMATCH')
    expect(result.error.reason).toContain('Expected 3')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns CATEGORY_IDS_MISMATCH when duplicate ids provided', async () => {
    const category1 = createTestCategory(householdId, 'Dairy')
    const category2 = createTestCategory(householdId, 'Vegetables')

    const repository = createMockRepository([category1, category2])
    const handler = new ReorderCategoriesCommandHandler(repository)

    const result = await handler.execute(
      { ids: [category1.id, category1.id] }, // duplicate
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.type).toBe('CATEGORY_IDS_MISMATCH')
    expect(result.error.reason).toContain('Duplicate')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('works with single category', async () => {
    const category = createTestCategory(householdId, 'Dairy')

    const repository = createMockRepository([category])
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

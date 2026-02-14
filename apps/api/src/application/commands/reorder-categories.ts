import { err, ok, type Result } from '@glist/shared'
import type { CategoryRepository } from '@/domain/category/category-repository'
import type { RequestContext } from '../shared/request-context'

export type ReorderCategoriesCommand = {
  ids: string[]
}

export type ReorderCategoriesError =
  | { type: 'CATEGORY_NOT_FOUND'; id: string }
  | { type: 'CATEGORY_IDS_MISMATCH'; reason: string }

export class ReorderCategoriesCommandHandler {
  constructor(private repository: CategoryRepository) {}

  async execute(
    command: ReorderCategoriesCommand,
    context: RequestContext,
  ): Promise<Result<void, ReorderCategoriesError>> {
    const { householdId } = context

    const categories = await this.repository.findAllByHouseholdId(householdId)

    // Verify all provided IDs belong to this household
    const existingIds = new Set(categories.map((c) => c.id as string))
    for (const id of command.ids) {
      if (!existingIds.has(id)) {
        return err({ type: 'CATEGORY_NOT_FOUND', id })
      }
    }

    // Verify all categories are included (no partial reorder)
    if (command.ids.length !== categories.length) {
      return err({
        type: 'CATEGORY_IDS_MISMATCH',
        reason: `Expected ${categories.length} category ids, got ${command.ids.length}`,
      })
    }

    // Check for duplicates
    const uniqueIds = new Set(command.ids)
    if (uniqueIds.size !== command.ids.length) {
      return err({
        type: 'CATEGORY_IDS_MISMATCH',
        reason: 'Duplicate category ids provided',
      })
    }

    // Update sort order for each category
    const categoryMap = new Map(categories.map((c) => [c.id as string, c]))
    const updates = command.ids.map((id, index) => {
      const category = categoryMap.get(id)
      if (!category) {
        throw new Error(`Category not found for id ${id}`)
      }
      category.changeSortOrder(index)
      return this.repository.save(category)
    })

    await Promise.all(updates)

    return ok(undefined)
  }
}

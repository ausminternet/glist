import { err, ok, type Result } from '@glist/shared'
import type { ChangeNameError } from '@/domain/category/category'
import type { CategoryRepository } from '@/domain/category/category-repository'
import type { CategoryNotFoundError } from '@/domain/category/errors'
import type { RequestContext } from '../shared/request-context'

export type ReplaceCategoryCommand = {
  categoryId: string
  name: string
}

export type ReplaceCategoryError = CategoryNotFoundError | ChangeNameError

export class ReplaceCategoryCommandHandler {
  constructor(private repository: CategoryRepository) {}

  async execute(
    command: ReplaceCategoryCommand,
    context: RequestContext,
  ): Promise<Result<void, ReplaceCategoryError>> {
    const category = await this.repository.findById(command.categoryId)

    if (!category || category.householdId !== context.householdId) {
      return err({ type: 'CATEGORY_NOT_FOUND', id: command.categoryId })
    }

    const nameResult = category.changeName(command.name)
    if (!nameResult.ok) {
      return err(nameResult.error)
    }

    await this.repository.save(category)

    return ok(undefined)
  }
}

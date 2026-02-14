import { err, ok, type Result } from '@glist/shared'
import type { CategoryRepository } from '@/domain/category/category-repository'
import type { RequestContext } from '../shared/request-context'

export type DeleteCategoryError = { type: 'CATEGORY_NOT_FOUND'; id: string }

export type DeleteCategoryCommand = {
  categoryId: string
}

export class DeleteCategoryCommandHandler {
  constructor(private repository: CategoryRepository) {}

  async execute(
    command: DeleteCategoryCommand,
    context: RequestContext,
  ): Promise<Result<void, DeleteCategoryError>> {
    const { householdId } = context

    const category = await this.repository.findById(command.categoryId)

    if (!category || category.householdId !== householdId) {
      return err({ type: 'CATEGORY_NOT_FOUND', id: command.categoryId })
    }

    await this.repository.delete(command.categoryId)

    return ok(undefined)
  }
}

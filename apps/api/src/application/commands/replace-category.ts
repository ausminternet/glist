import { ChangeNameError } from '@/domain/category/category'
import { CategoryRepository } from '@/domain/category/category-repository'
import { CategoryNotFoundError } from '@/domain/category/errors'
import { err, ok, Result } from '@glist/shared'
import { RequestContext } from '../shared/request-context'

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
    const { householdId } = context

    const category = await this.repository.findById(command.categoryId)

    if (!category || category.householdId !== householdId) {
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

import { CategoryRepository } from '@/domain/category/category-repository';
import { err, ok, Result } from '@glist/shared';
import { RequestContext } from '../shared/request-context';

export type DeleteCategoryError = { type: 'CATEGORY_NOT_FOUND'; id: string }

export class DeleteCategoryCommandHandler {
  constructor(private repository: CategoryRepository) {}

  async execute(
    categoryId: string,
    context: RequestContext,
  ): Promise<Result<void, DeleteCategoryError>> {
    const { householdId } = context

    const category = await this.repository.findById(categoryId)

    if (!category || category.householdId !== householdId) {
      return err({ type: 'CATEGORY_NOT_FOUND', id: categoryId })
    }

    await this.repository.delete(categoryId)

    return ok(undefined)
  }
}

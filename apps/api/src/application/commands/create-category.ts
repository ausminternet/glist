import { err, ok, type Result } from '@glist/shared'
import { Category, type CreateCategoryError } from '@/domain/category/category'
import { generateCategoryId } from '@/domain/category/category-id'
import type { CategoryRepository } from '@/domain/category/category-repository'
import { parseHouseholdId } from '@/domain/household/household-id'
import type { RequestContext } from '../shared/request-context'

export type CreateCategoryCommand = {
  name: string
}

export class CreateCategoryCommandHandler {
  constructor(private repository: CategoryRepository) {}

  async execute(
    command: CreateCategoryCommand,
    context: RequestContext,
  ): Promise<Result<string, CreateCategoryError>> {
    const householdId = parseHouseholdId(context.householdId)

    const result = Category.create(generateCategoryId(), householdId, {
      name: command.name,
    })

    if (!result.ok) {
      return err(result.error)
    }

    await this.repository.save(result.value)

    return ok(result.value.id)
  }
}

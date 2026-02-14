import { err, ok, type Result } from '@glist/shared'
import { parseHouseholdId } from '@/domain/shared/household-id'
import {
  type CreateShoppingListError,
  ShoppingList,
} from '@/domain/shopping-list/shopping-list'
import { generateShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { RequestContext } from '../shared/request-context'

type CreateShoppingListCommandError = CreateShoppingListError

export type CreateShoppingListCommand = {
  name: string
}

export class CreateShoppingListCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    command: CreateShoppingListCommand,
    context: RequestContext,
  ): Promise<Result<string, CreateShoppingListCommandError>> {
    const { name } = command
    const householdId = parseHouseholdId(context.householdId)

    const newList = ShoppingList.create(
      generateShoppingListId(),
      householdId,
      name,
    )

    if (!newList.ok) {
      return err(newList.error)
    }

    await this.repository.save(newList.value)

    return ok(newList.value.id)
  }
}

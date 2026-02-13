import { parseHouseholdId } from '@/domain/shared/household-id'
import {
  CreateShoppingListError,
  ShoppingList,
} from '@/domain/shopping-list/shopping-list'
import { generateShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { err, ok, Result } from '@glist/shared'
import z from 'zod'
import { RequestContext } from '../shared/request-context'

type CreateShoppingListCommandError = CreateShoppingListError

export const CreateShoppingListCommandSchema = z.object({
  name: z.string().trim().nonempty('Name cannot be empty'),
})

export type CreateShoppingListCommand = z.infer<
  typeof CreateShoppingListCommandSchema
>

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

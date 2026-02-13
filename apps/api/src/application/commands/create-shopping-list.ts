import { InvalidNameError } from '@/domain/shopping-list/errors'
import { ShoppingList } from '@/domain/shopping-list/shopping-list'
import { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import { err, ok, Result } from '@glist/shared'
import z from 'zod'
import { RequestContext } from '../shared/request-context'

type CreateShoppingListCommandError = InvalidNameError

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
    const { householdId } = context

    const newList = ShoppingList.create(householdId, name)

    if (!newList.ok) {
      return err(newList.error)
    }

    await this.repository.save(newList.value)

    return ok(newList.value.id)
  }
}

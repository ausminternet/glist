import { err, ok, type Result } from '@glist/shared'
import { isBlank } from '@/utils/is-blank'
import type { InvalidNameError } from '../shared/errors'
import type { HouseholdId } from '../shared/household-id'
import type { ShoppingListId } from './shopping-list-id'

export type ShoppingListProps = {
  id: ShoppingListId
  householdId: HouseholdId
  name: string
  createdAt: Date
  updatedAt: Date | null
}

export type CreateShoppingListError = InvalidNameError

export type ChangeNameError = InvalidNameError

export class ShoppingList {
  constructor(private props: ShoppingListProps) {}

  static create(
    id: ShoppingListId,
    householdId: HouseholdId,
    name: string,
  ): Result<ShoppingList, CreateShoppingListError> {
    if (isBlank(name)) {
      return err({ type: 'INVALID_NAME', reason: 'Name cannot be empty' })
    }

    return ok(
      new ShoppingList({
        id,
        householdId,
        name,
        createdAt: new Date(),
        updatedAt: null,
      }),
    )
  }

  get id(): ShoppingListId {
    return this.props.id
  }
  get householdId(): HouseholdId {
    return this.props.householdId
  }
  get name(): string {
    return this.props.name
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date | null {
    return this.props.updatedAt
  }

  changeName(name: string): Result<void, ChangeNameError> {
    if (isBlank(name)) {
      return err({ type: 'INVALID_NAME', reason: 'Name cannot be empty' })
    }

    this.props.name = name
    this.props.updatedAt = new Date()

    return ok(undefined)
  }
}

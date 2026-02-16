import { err, ok, type Result } from '@glist/shared'
import { isBlank } from '@/utils/is-blank'
import type { InvalidNameError } from '../shared/errors'
import type { HouseholdId } from './household-id'

export type NewHouseholdInput = {
  name: string
}

export type HouseholdProps = {
  id: HouseholdId
  name: string
  createdAt: Date
  updatedAt: Date | null
}

export type CreateHouseholdError = InvalidNameError

export type ChangeNameError = InvalidNameError

export class Household {
  constructor(private props: HouseholdProps) {}

  static create(
    id: HouseholdId,
    input: NewHouseholdInput,
  ): Result<Household, CreateHouseholdError> {
    if (isBlank(input.name)) {
      return err({ type: 'INVALID_NAME', reason: 'Name cannot be empty' })
    }

    return ok(
      new Household({
        id,
        name: input.name,
        createdAt: new Date(),
        updatedAt: null,
      }),
    )
  }

  get id(): HouseholdId {
    return this.props.id
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

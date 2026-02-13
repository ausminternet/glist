import { isBlank } from '@/utils/is-blank';
import { err, ok, Result } from '@glist/shared';
import { InvalidNameError } from '../shared/errors';
import { HouseholdId } from '../shared/household-id';
import { ShopId } from './shop-id';

export type NewShopInput = {
  name: string
  sortOrder?: number
}

export type ShopProps = {
  id: ShopId
  householdId: HouseholdId
  name: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date | null
}

export type CreateShopError = InvalidNameError

export type ChangeNameError = InvalidNameError

export type ChangeSortOrderError = {
  type: 'INVALID_SORT_ORDER'
  reason: string
}

export class Shop {
  constructor(private props: ShopProps) {}

  static create(
    id: ShopId,
    householdId: HouseholdId,
    input: NewShopInput,
  ): Result<Shop, CreateShopError> {
    if (isBlank(input.name)) {
      return err({ type: 'INVALID_NAME', reason: 'Name cannot be empty' })
    }

    return ok(
      new Shop({
        id,
        householdId,
        name: input.name,
        sortOrder: input.sortOrder ?? 1000.0,
        createdAt: new Date(),
        updatedAt: null,
      }),
    )
  }

  get id(): ShopId {
    return this.props.id
  }

  get householdId(): HouseholdId {
    return this.props.householdId
  }

  get name(): string {
    return this.props.name
  }

  get sortOrder(): number {
    return this.props.sortOrder
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

  changeSortOrder(sortOrder: number): Result<void, ChangeSortOrderError> {
    if (sortOrder < 0) {
      return err({
        type: 'INVALID_SORT_ORDER',
        reason: 'Sort order must be non-negative',
      })
    }
    this.props.sortOrder = sortOrder
    this.props.updatedAt = new Date()

    return ok(undefined)
  }
}

import {
  err,
  isValidUnitType,
  ok,
  type Result,
  type UnitType,
} from '@glist/shared'

export type QuantityError =
  | { type: 'INVALID_QUANTITY' }
  | { type: 'UNIT_WITHOUT_VALUE' }
  | { type: 'INVALID_UNIT'; unit: string }

export class Quantity {
  private constructor(
    public readonly value: number | null,
    public readonly unit: UnitType | null,
  ) {}

  static create(
    value: number | null,
    unit: string | null,
  ): Result<Quantity, QuantityError> {
    if (value !== null && value <= 0) {
      return err({ type: 'INVALID_QUANTITY' })
    }

    if (unit !== null && value === null) {
      return err({ type: 'UNIT_WITHOUT_VALUE' })
    }

    if (unit !== null && !isValidUnitType(unit)) {
      return err({ type: 'INVALID_UNIT', unit })
    }

    return ok(new Quantity(value, unit as UnitType | null))
  }

  static empty(): Quantity {
    return new Quantity(null, null)
  }
}

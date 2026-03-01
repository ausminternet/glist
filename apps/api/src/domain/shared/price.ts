import {
  err,
  isValidUnitType,
  ok,
  type Result,
  type UnitType,
} from '@glist/shared'

export type PriceError =
  | { type: 'INVALID_PRICE' }
  | { type: 'INVALID_UNIT'; unit: string }

export class Price {
  private constructor(
    public readonly cents: number | null,
    public readonly unit: UnitType | null,
  ) {}

  static create(
    cents: number | null,
    unit: string | null,
  ): Result<Price, PriceError> {
    if (cents !== null && cents <= 0) {
      return err({ type: 'INVALID_PRICE' })
    }

    if (unit !== null && !isValidUnitType(unit)) {
      return err({ type: 'INVALID_UNIT', unit })
    }

    return ok(new Price(cents, unit as UnitType | null))
  }

  static empty(): Price {
    return new Price(null, null)
  }
}

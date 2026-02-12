import { InvalidUnitError, isValidUnitType, UnitType } from '@glist/shared'

export class PriceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PriceError'
  }
}

export class InvalidPriceError extends PriceError {
  constructor() {
    super('Price must be greater than zero')
  }
}

export class UnitWithoutValueError extends PriceError {
  constructor() {
    super('Unit cannot be specified without a price value')
  }
}

export class Price {
  private constructor(
    public readonly cents: number | null,
    public readonly unit: UnitType | null,
  ) {}

  static create(cents: number | null, unit: string | null): Price {
    if (cents !== null && cents <= 0) {
      throw new InvalidPriceError()
    }

    if (unit !== null && cents === null) {
      throw new UnitWithoutValueError()
    }

    if (unit !== null && !isValidUnitType(unit)) {
      throw new InvalidUnitError(unit)
    }

    return new Price(cents, unit as UnitType | null)
  }

  static empty(): Price {
    return new Price(null, null)
  }
}

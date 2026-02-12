export class QuantityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QuantityError'
  }
}

export class InvalidQuantityError extends QuantityError {
  constructor() {
    super('Quantity must be greater than zero')
  }
}

export class UnitWithoutValueError extends QuantityError {
  constructor() {
    super('Unit cannot be specified without a value')
  }
}

export class Quantity {
  private constructor(
    public readonly value: number | null,
    public readonly unit: string | null,
  ) {}

  static create(value: number | null, unit: string | null): Quantity {
    if (value !== null && value <= 0) {
      throw new InvalidQuantityError()
    }

    if (unit !== null && value === null) {
      throw new UnitWithoutValueError()
    }

    return new Quantity(value, unit)
  }

  static empty(): Quantity {
    return new Quantity(null, null)
  }
}

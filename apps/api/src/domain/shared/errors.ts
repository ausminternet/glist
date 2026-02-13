export type InvalidNameError = { type: 'INVALID_NAME'; reason: string }
export type InvalidQuantityError = { type: 'INVALID_QUANTITY' }
export type UnitWithoutValueError = { type: 'UNIT_WITHOUT_VALUE' }
export type InvalidUnitError = { type: 'INVALID_UNIT'; unit: string }
export type InvalidPriceError = { type: 'INVALID_PRICE' }
export type PriceUnitWithoutValueError = { type: 'PRICE_UNIT_WITHOUT_VALUE' }

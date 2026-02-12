export const unitTypes = [
  'piece',
  'kg',
  'g',
  'l',
  'ml',
  'can',
  'bottle',
  'pack',
] as const

export type UnitType = (typeof unitTypes)[number]

export function isValidUnitType(value: string): value is UnitType {
  return unitTypes.includes(value as UnitType)
}

export class InvalidUnitError extends Error {
  constructor(unit: string) {
    super(`Invalid unit: ${unit}`)
    this.name = 'InvalidUnitError'
  }
}

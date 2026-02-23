export const UNIT_TYPES = [
  'piece',
  'kg',
  'g',
  'l',
  'ml',
  'can',
  'bottle',
  'pack',
] as const

export type UnitType = (typeof UNIT_TYPES)[number]

export function isValidUnitType(value: string): value is UnitType {
  return UNIT_TYPES.includes(value as UnitType)
}

export class InvalidUnitError extends Error {
  constructor(unit: string) {
    super(`Invalid unit: ${unit}`)
    this.name = 'InvalidUnitError'
  }
}

export const UNIT_LABELS: Record<
  UnitType,
  { singular: string; plural: string; combined: string }
> = {
  piece: { singular: 'Stück', plural: 'Stück', combined: 'Stück' },
  kg: { singular: 'kg', plural: 'kg', combined: 'kg' },
  g: { singular: 'g', plural: 'g', combined: 'g' },
  l: { singular: 'Liter', plural: 'Liter', combined: 'Liter' },
  ml: { singular: 'ml', plural: 'ml', combined: 'ml' },
  can: { singular: 'Dose', plural: 'Dosen', combined: 'Dose(n)' },
  bottle: {
    singular: 'Flasche',
    plural: 'Flaschen',
    combined: 'Flasche(n)',
  },
  pack: { singular: 'Packung', plural: 'Packungen', combined: 'Packung(en)' },
}

export const UNIT_ABBREVIATIONS: Record<UnitType, string> = {
  piece: 'Stk.',
  kg: 'kg',
  g: 'g',
  l: 'l',
  ml: 'ml',
  can: 'D.',
  bottle: 'Fl.',
  pack: 'Pkg.',
}

export function getUnitLabel(unit: UnitType | null, count: number | null) {
  if (!unit) return ''

  const label = UNIT_LABELS[unit]

  if (!count) return label.combined

  return count === 1 ? label.singular : label.plural
}

export function getUnitAbbreviation(unit: UnitType | undefined) {
  if (!unit) return ''

  return UNIT_ABBREVIATIONS[unit]
}

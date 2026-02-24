export function centsToEuro(cents: number): number
export function centsToEuro(cents?: number | null): number | undefined
export function centsToEuro(cents?: number | null) {
  return cents == null ? undefined : cents / 100
}

export function euroToCents(euro: number): number
export function euroToCents(euro?: number | null): number | undefined
export function euroToCents(euro?: number | null) {
  if (euro == null) return undefined
  return Math.round(euro * 100)
}

export function formatEuro(value?: number): string {
  if (value == null || Number.isNaN(value)) return ''
  return value.toFixed(2).replace('.', ',')
}

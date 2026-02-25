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

const numberFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  style: 'currency',
  currency: 'EUR',
})

export function formatEuroCents(value: number): string {
  return numberFormatter.format(centsToEuro(value))
}

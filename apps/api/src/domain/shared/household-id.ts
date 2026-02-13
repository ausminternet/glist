const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type HouseholdId = string & { readonly __brand: 'HouseholdId' }

export const parseHouseholdId = (raw: string): HouseholdId => {
  if (!UUID_REGEX.test(raw)) {
    throw new Error('invalid HouseholdId')
  }
  return raw as HouseholdId
}

export const generateHouseholdId = (): HouseholdId =>
  crypto.randomUUID() as HouseholdId

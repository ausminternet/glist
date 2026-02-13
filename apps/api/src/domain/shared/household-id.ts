import { assertValidUuid, DomainId, generateId } from './domain-id'

export type HouseholdId = DomainId<'HouseholdId'>

export const parseHouseholdId = (raw: string): HouseholdId => {
  assertValidUuid(raw)
  return raw as HouseholdId
}

export const generateHouseholdId = (): HouseholdId =>
  generateId<'HouseholdId'>()

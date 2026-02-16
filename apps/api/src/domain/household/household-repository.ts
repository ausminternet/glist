import type { Household } from './household'
import type { HouseholdId } from './household-id'

export interface HouseholdRepository {
  save(household: Household): Promise<void>
  find(id: HouseholdId): Promise<Household | null>
  delete(id: HouseholdId): Promise<void>
}

import type { HouseholdView } from '@glist/views'
import type { HouseholdId } from './household-id'

export interface HouseholdQueryRepository {
  find(id: HouseholdId): Promise<HouseholdView | null>
  getAll(): Promise<HouseholdView[]>
}

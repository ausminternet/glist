import type { CategoryView } from '@glist/views'

export interface CategoryQueryRepository {
  findAllByHouseholdId(householdId: string): Promise<CategoryView[]>
}

import type { CategoryView } from '@glist/views'

export interface CategoryQueryRepository {
  getAll(householdId: string): Promise<CategoryView[]>
}

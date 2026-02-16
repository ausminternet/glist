import type { ShopView } from '@glist/views'

export interface ShopQueryRepository {
  getAll(householdId: string): Promise<ShopView[]>
}

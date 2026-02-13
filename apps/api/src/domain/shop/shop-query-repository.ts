import { ShopView } from '@glist/views'

export interface ShopQueryRepository {
  findAllByHouseholdId(householdId: string): Promise<ShopView[]>
}

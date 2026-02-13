import { InventoryItemView } from '@glist/views'

export interface InventoryItemQueryRepository {
  findAllByHouseholdId(householdId: string): Promise<InventoryItemView[]>
}

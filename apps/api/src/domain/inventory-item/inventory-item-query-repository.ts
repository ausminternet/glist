import type { InventoryItemView } from '@glist/views'

export interface InventoryItemQueryRepository {
  getAll(householdId: string): Promise<InventoryItemView[]>
}

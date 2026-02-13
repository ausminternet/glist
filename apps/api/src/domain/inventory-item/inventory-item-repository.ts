import { InventoryItem } from './inventory-item'

export interface InventoryItemRepository {
  findAllByHouseholdId(householdId: string): Promise<InventoryItem[]>
  save(item: InventoryItem): Promise<void>
}

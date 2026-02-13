import { InventoryItem } from './inventory-item'

export interface InventoryItemRepository {
  findById(id: string): Promise<InventoryItem | null>
  findAllByHouseholdId(householdId: string): Promise<InventoryItem[]>
  save(item: InventoryItem): Promise<void>
}

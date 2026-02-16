import type { ShoppingListItem } from './shopping-list-item'

export interface ShoppingListItemRepository {
  save(item: ShoppingListItem): Promise<void>
  findById(id: string): Promise<ShoppingListItem | null>
  findCheckedByHouseholdId(householdId: string): Promise<ShoppingListItem[]>
  delete(id: string): Promise<void>
  deleteCheckedByHouseholdId(householdId: string): Promise<void>
}

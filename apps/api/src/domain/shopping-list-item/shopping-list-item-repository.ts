import type { ShoppingListItem } from './shopping-list-item'

export interface ShoppingListItemRepository {
  save(item: ShoppingListItem): Promise<void>
  find(id: string): Promise<ShoppingListItem | null>
  delete(id: string): Promise<void>
  deleteCheckedByHouseholdId(householdId: string): Promise<void>
}

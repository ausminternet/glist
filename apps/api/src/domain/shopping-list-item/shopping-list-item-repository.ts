import type { ShoppingListItem } from './shopping-list-item'

export interface ShoppingListItemRepository {
  save(item: ShoppingListItem): Promise<void>
  findById(id: string): Promise<ShoppingListItem | null>
  delete(id: string): Promise<void>
  deleteCheckedByShoppingListId(shoppingListId: string): Promise<void>
}

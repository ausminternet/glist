import type { ShoppingListItemView } from '@glist/views'

export interface ShoppingListItemQueryRepository {
  find(id: string): Promise<ShoppingListItemView | null>
  getAll(householdId: string): Promise<ShoppingListItemView[]>
}

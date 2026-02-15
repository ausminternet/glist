import type { ShoppingListView } from '@glist/views'

export interface ShoppingListQueryRepository {
  findAllByHouseholdId(householdId: string): Promise<ShoppingListView[]>
  find(listId: string): Promise<ShoppingListView>
}

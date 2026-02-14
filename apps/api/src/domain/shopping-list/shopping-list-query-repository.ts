import type { ShoppingListView } from '@glist/views'

export interface ShoppingListQueryRepository {
  findById(id: string): Promise<ShoppingListView | null>
}

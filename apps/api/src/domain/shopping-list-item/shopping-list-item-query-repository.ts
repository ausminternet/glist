import type { ShoppingListItemView } from '@glist/views'

export interface ShoppingListItemQueryRepository {
  findById(id: string): Promise<ShoppingListItemView | null>
  findAllByShoppingListId(
    shoppingListId: string,
  ): Promise<ShoppingListItemView[]>
}

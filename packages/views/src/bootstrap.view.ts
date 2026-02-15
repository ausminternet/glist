import type { CategoryView } from './category.view'
import type { InventoryItemView } from './inventory-item.view'
import type { ShopView } from './shop.view'
import type { ShoppingListWithItemsView } from './shopping-list.view'

export type BootstrapView = {
  shoppingLists: ShoppingListWithItemsView[]
  inventoryItems: InventoryItemView[]
  categories: CategoryView[]
  shops: ShopView[]
}

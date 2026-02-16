import type { CategoryView } from './category.view'
import type { InventoryItemView } from './inventory-item.view'
import type { ShopView } from './shop.view'
import type { ShoppingListItemView } from './shopping-list-item.view'

export type BootstrapView = {
  shoppingListItems: ShoppingListItemView[]
  inventoryItems: InventoryItemView[]
  categories: CategoryView[]
  shops: ShopView[]
}

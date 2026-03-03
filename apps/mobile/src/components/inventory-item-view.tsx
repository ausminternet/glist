import type { InventoryItemView } from '@glist/views'
import { useShoppingListItems } from '@/api/shopping-list-items'
import { useShops } from '@/api/shops'
import { useHouseholdId } from '@/hooks/use-household-id'
import { colors } from './colors'
import { ListItem } from './list-item.component'

export interface InventoryItemProps {
  inventoryItem: InventoryItemView
}

export function InventoryItem({ inventoryItem }: InventoryItemProps) {
  const householdId = useHouseholdId()
  const { shops } = useShops()
  const { shoppingListItems } = useShoppingListItems()

  const shoppingListItem = shoppingListItems.find(
    (shoppingListItem) => shoppingListItem.inventoryItemId === inventoryItem.id,
  )

  const isOnShoppingList = shoppingListItem && !shoppingListItem.checked

  const shopNames = shops
    .filter((shop) => inventoryItem.shopIds.includes(shop.id))
    .map((s) => s.name)
    .join(', ')

  const inventoryItemQuickViewUrl =
    `/${householdId}/sheets/inventory-item-quick-view?inventoryItemId=${inventoryItem.id}` as const

  return (
    <ListItem
      icon={isOnShoppingList ? 'cart.fill' : 'cart'}
      iconTintColor={
        isOnShoppingList ? colors.system.blue : colors.label.tertiary
      }
      iconSize={24}
      right={shopNames}
      subtitle={inventoryItem.description}
      href={inventoryItemQuickViewUrl}
      chevron={false}
    >
      {inventoryItem.name}
    </ListItem>
  )
}

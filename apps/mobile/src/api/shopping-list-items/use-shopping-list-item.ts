import { useShoppingListItems } from './use-shopping-list-items'

export interface UseShoppingListItemProps {
  householdId: string
  itemId: string
}

export function useShoppingListItem(itemId: string, householdId: string) {
  const { shoppingListItems, ...rest } = useShoppingListItems(householdId)

  const item = shoppingListItems.find((item) => item.id === itemId)

  return { shoppingListItem: item, ...rest }
}

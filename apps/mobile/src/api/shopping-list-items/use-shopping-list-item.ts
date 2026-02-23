import { useShoppingListItems } from './use-shopping-list-items'

export function useShoppingListItem(itemId: string) {
  const { shoppingListItems, ...rest } = useShoppingListItems()

  const item = shoppingListItems.find((item) => item.id === itemId)

  return { shoppingListItem: item, ...rest }
}

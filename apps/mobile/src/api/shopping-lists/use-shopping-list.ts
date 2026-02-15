import { useShoppingLists } from './use-shopping-lists'

export function useShoppingList(householdId: string, shoppingListId: string) {
  const { shoppingLists, ...rest } = useShoppingLists(householdId)

  const shoppingList = shoppingLists.find((list) => list.id === shoppingListId)
  if (!shoppingList) {
    throw new Error('Shopping list not found')
  }

  return { shoppingList, ...rest }
}

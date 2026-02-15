import { useLocalSearchParams } from 'expo-router'

export const useShoppingListId = () => {
  const { shoppingListId } = useLocalSearchParams<{ shoppingListId: string }>()

  if (!shoppingListId) {
    throw new Error('shoppingListId is required')
  }

  return shoppingListId
}

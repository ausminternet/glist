import type { ShoppingListItemView } from '@glist/views'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { getShoppingListItems } from './get-shopping-list-items'

export function useShoppingListItems(householdId: string) {
  const { data: items = [], ...rest } = useQuery<ShoppingListItemView[]>({
    queryKey: queryKeys.shoppingListItems(householdId),
    queryFn: () => getShoppingListItems(householdId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return { items, ...rest }
}

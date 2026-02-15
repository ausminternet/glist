import type { ShoppingListItemView } from '@glist/views'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../query-keys'
import { getShoppingListItems } from './get-shopping-list-items'

export function useShoppingListItems(householdId: string, listId: string) {
  const queryClient = useQueryClient()

  // Get prefilled data from cache (set by useShoppingLists)
  const initialData = queryClient.getQueryData<ShoppingListItemView[]>(
    queryKeys.shoppingListItems(householdId, listId),
  )

  const { data = [], ...rest } = useQuery({
    queryKey: queryKeys.shoppingListItems(householdId, listId),
    queryFn: () => getShoppingListItems(householdId, listId),
    initialData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return { shoppingListItems: data, ...rest }
}

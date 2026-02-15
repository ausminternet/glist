import type { ShoppingListView } from '@glist/views'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { getShoppingLists } from './get-shopping-lists'

type UseShoppingListsOptions = {
  enabled?: boolean
}

export function useShoppingLists(
  householdId: string,
  options: UseShoppingListsOptions = {},
) {
  const { enabled = true } = options

  const { data = [], ...rest } = useQuery<ShoppingListView[]>({
    queryKey: queryKeys.shoppingLists(householdId),
    queryFn: () => getShoppingLists(householdId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled,
  })

  return { shoppingLists: data, ...rest }
}

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { getShoppingLists } from './get-shopping-lists'

export function useShoppingLists(householdId: string) {
  const { data = [], ...rest } = useQuery({
    queryKey: queryKeys.shoppingLists(householdId),
    queryFn: () => getShoppingLists(householdId),
  })

  return { shoppingLists: data, ...rest }
}

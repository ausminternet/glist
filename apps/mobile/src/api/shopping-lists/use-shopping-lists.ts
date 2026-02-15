import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queryKeys } from '../query-keys'
import { getShoppingLists } from './get-shopping-lists'

export function useShoppingLists(householdId: string) {
  const queryClient = useQueryClient()

  const { data = [], ...rest } = useQuery({
    queryKey: queryKeys.shoppingLists(householdId),
    queryFn: () => getShoppingLists(householdId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  useEffect(() => {
    data.forEach((list) => {
      queryClient.setQueryData(
        queryKeys.shoppingListItems(householdId, list.id),
        list.items,
      )
    })
  }, [data, queryClient, householdId])

  const getShoppingList = (shoppingListId: string) => {
    return data.find((list) => list.id === shoppingListId)
  }

  return { shoppingLists: data, getShoppingList, ...rest }
}

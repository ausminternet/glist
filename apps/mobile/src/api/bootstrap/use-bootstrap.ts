import type { BootstrapView } from '@glist/views'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { getBootstrap } from './get-bootstrap'

export function useBootstrap(householdId: string) {
  const queryClient = useQueryClient()

  return useQuery<BootstrapView>({
    queryKey: ['bootstrap', householdId],
    queryFn: async () => {
      const data = await getBootstrap(householdId)

      // Populate all caches immediately
      queryClient.setQueryData(
        queryKeys.shoppingListItems(householdId),
        data.shoppingListItems,
      )

      queryClient.setQueryData(
        queryKeys.categories(householdId),
        data.categories,
      )

      queryClient.setQueryData(queryKeys.shops(householdId), data.shops)

      queryClient.setQueryData(
        queryKeys.inventoryItems(householdId),
        data.inventoryItems,
      )

      return data
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

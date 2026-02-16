import type { BootstrapView } from '@glist/views'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useHouseholdContext } from '@/provider/household-provider'
import { ApiError } from '../client'
import { queryKeys } from '../query-keys'
import { getBootstrap } from './get-bootstrap'

export function useBootstrap(householdId: string) {
  const queryClient = useQueryClient()
  const { clearHousehold } = useHouseholdContext()

  const query = useQuery<BootstrapView>({
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
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.isNotFound) {
        return false
      }
      return failureCount < 2
    },
  })

  useEffect(() => {
    if (query.error instanceof ApiError && query.error.isNotFound) {
      clearHousehold(true)
    }
  }, [query.error, clearHousehold])

  return query
}

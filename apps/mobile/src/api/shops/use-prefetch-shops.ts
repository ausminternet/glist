import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queryKeys } from '../query-keys'
import { getShops } from './get-shops'

export const usePrefetchShops = (householdId?: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!householdId) return

    queryClient.prefetchQuery({
      queryKey: queryKeys.shops(householdId),
      queryFn: () => getShops(householdId),
    })
  }, [queryClient, householdId])
}

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queryKeys } from '../query-keys'
import { getCategories } from './get-categories'

export const usePrefetchCategories = (householdId?: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!householdId) return

    queryClient.prefetchQuery({
      queryKey: queryKeys.categories(householdId),
      queryFn: () => getCategories(householdId),
    })
  }, [queryClient, householdId])
}

import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useHouseholdContext } from '@/provider/household-provider'
import { queryKeys } from '../query-keys'
import { getHouseholds } from './get-households'

export function useHouseholds() {
  const { householdNotFound } = useHouseholdContext()

  const { data, isPending, refetch, ...rest } = useQuery({
    queryKey: queryKeys.households(),
    queryFn: getHouseholds,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  useEffect(() => {
    if (householdNotFound) {
      refetch()
    }
  }, [householdNotFound, refetch])

  return { households: data ?? [], isPending, refetch, ...rest }
}

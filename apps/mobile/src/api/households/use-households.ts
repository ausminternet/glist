import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { getHouseholds } from './get-households'

export function useHouseholds() {
  const { data = [], ...rest } = useQuery({
    queryKey: queryKeys.households(),
    queryFn: getHouseholds,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return { households: data, ...rest }
}

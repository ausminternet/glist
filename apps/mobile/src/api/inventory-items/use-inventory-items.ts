import { useQuery } from '@tanstack/react-query'
import { useHouseholdId } from '@/hooks/use-household-id'
import { queryKeys } from '../query-keys'
import { getInventoryItems } from './get-inventory-items'

export function useInventoryItems() {
  const householdId = useHouseholdId()

  const { data = [], ...rest } = useQuery({
    queryKey: queryKeys.inventoryItems(householdId),
    queryFn: () => getInventoryItems(householdId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: 'always',
  })

  return { inventoryItems: data, ...rest }
}

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { getInventoryItems } from './get-inventory-items'

export function useInventoryItems(householdId: string) {
  const { data = [], ...rest } = useQuery({
    queryKey: queryKeys.inventoryItems(householdId),
    queryFn: () => getInventoryItems(householdId),
    staleTime: 5 * 60,
    gcTime: 10 * 60,
  })

  return { inventoryItems: data, ...rest }
}

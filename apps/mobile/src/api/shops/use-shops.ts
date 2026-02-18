import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { getShops as getShopsApi } from './get-shops'

export function useShops(householdId: string) {
  const { data = [], ...rest } = useQuery({
    queryKey: queryKeys.shops(householdId),
    queryFn: () => getShopsApi(householdId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const getShop = (id: string) => data.find((shop) => shop.id === id)

  const getShops = (ids: string[]) => ids.map((id) => getShop(id))

  const getShopName = (id: string) => data.find((shop) => shop.id === id)?.name

  return { shops: data, ...rest, getShop, getShops, getShopName }
}

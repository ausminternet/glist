import type { ShoppingListItemView } from '@glist/views'
import { useQuery } from '@tanstack/react-query'
import { useHouseholdId } from '@/hooks/use-household-id'
import { queryKeys } from '../query-keys'
import { getShoppingListItems } from './get-shopping-list-items'

export function useShoppingListItems() {
  const householdId = useHouseholdId()
  const { data: shoppingListItems = [], ...rest } = useQuery<
    ShoppingListItemView[]
  >({
    queryKey: queryKeys.shoppingListItems(householdId),
    queryFn: () => getShoppingListItems(householdId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: 'always',
  })

  const getShoppingListItemsByShopId = (
    shopId: string,
    withNoShop: boolean,
  ) => {
    return shoppingListItems.filter((item) => {
      if (withNoShop) {
        return item.shopIds.includes(shopId) || item.shopIds.length === 0
      }
      return item.shopIds.includes(shopId)
    })
  }

  const getShoppingListItemCountByShopId = (
    shopId: string,
    withNoShop: boolean,
  ) => {
    return getShoppingListItemsByShopId(shopId, withNoShop).length
  }

  const checkedItemsCount = shoppingListItems.filter(
    (item) => item.checked,
  ).length
  const uncheckedItemsCount = shoppingListItems.filter(
    (item) => !item.checked,
  ).length

  return {
    shoppingListItems,
    itemCounts: {
      all: shoppingListItems.length,
      checked: checkedItemsCount,
      unchecked: uncheckedItemsCount,
    },
    getShoppingListItemsByShopId,
    getShoppingListItemCountByShopId,
    ...rest,
  }
}

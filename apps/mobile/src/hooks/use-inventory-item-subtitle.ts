import type { InventoryItemView } from '@glist/views'
import { useCallback } from 'react'
import { useCategories } from '@/api/categories'
import { useShops } from '@/api/shops'

export function useInventoryItemSubtitle() {
  const { categories = [] } = useCategories()
  const { shops = [] } = useShops()

  const getSubtitle = useCallback(
    (item: InventoryItemView) => {
      const shopNames = item.shopIds
        .map((shopId) => shops.find((shop) => shop.id === shopId)?.name)
        .filter(Boolean)
        .join(', ')

      const categoryName = categories.find(
        (category) => category.id === item.categoryId,
      )?.name

      const parts = [categoryName, shopNames].filter(Boolean)
      return parts.join(' • ')
    },
    [categories, shops],
  )

  return { getSubtitle }
}

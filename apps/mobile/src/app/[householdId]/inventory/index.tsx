import { Text, View } from 'react-native'
import { useCategories } from '@/api/categories/use-categories'
import { useInventoryItems } from '@/api/inventory-items/use-inventory-items'
import { useShops } from '@/api/shops/use-shops'
import { useHouseholdId } from '@/utils/use-household-id'

export default function Index() {
  const householdId = useHouseholdId()
  const { getShopName } = useShops(householdId)
  const { getCategoryName } = useCategories(householdId)
  const { inventoryItems } = useInventoryItems(householdId)

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {inventoryItems.map((item) => (
        <Text key={item.id}>
          {item.name}, Shops:{' '}
          {item.shopIds.map((shopId) => getShopName(shopId)).join(', ')}
          Category: {item.categoryId ? getCategoryName(item.categoryId) : 'N/A'}
        </Text>
      ))}
    </View>
  )
}

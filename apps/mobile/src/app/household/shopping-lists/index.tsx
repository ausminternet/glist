import { Text, View } from 'react-native'
import { useCategories } from '@/api/categories'
import { useShoppingListEvents } from '@/api/events'
import { useShoppingListItems } from '@/api/shopping-list-items'
import { useShops } from '@/api/shops'
import { useHouseholdId } from '@/provider/household-provider'

export default function Index() {
  const householdId = useHouseholdId()

  const { items } = useShoppingListItems(householdId)
  const { getShopName } = useShops(householdId)
  const { getCategoryName } = useCategories(householdId)

  useShoppingListEvents(householdId)

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Einkaufsliste</Text>
      {items.map((item) => (
        <Text key={item.id}>
          {item.name}, checked: {item.checked ? 'Yes' : 'No'}, Shops:{' '}
          {item.shopIds.map((shopId) => getShopName(shopId)).join(', ')}
          Category: {item.categoryId ? getCategoryName(item.categoryId) : 'N/A'}
        </Text>
      ))}
    </View>
  )
}

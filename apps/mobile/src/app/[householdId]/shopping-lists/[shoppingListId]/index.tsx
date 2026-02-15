import { Text, View } from 'react-native'
import { useCategories } from '@/api/categories'
import { useShoppingListEvents } from '@/api/events'
import { useShoppingListItems } from '@/api/shopping-lists/items/use-shopping-list-items'
import { useShoppingList } from '@/api/shopping-lists/use-shopping-list'
import { useShops } from '@/api/shops'
import { useHouseholdId } from '@/utils/use-household-id'
import { useShoppingListId } from '@/utils/use-shopping-list-id'
export default function Index() {
  const householdId = useHouseholdId()
  const shoppingListId = useShoppingListId()
  const { shoppingList } = useShoppingList(householdId, shoppingListId)
  const { items } = useShoppingListItems(householdId, shoppingListId)
  const { getShopName } = useShops(householdId)
  const { getCategoryName } = useCategories(householdId)

  useShoppingListEvents(householdId, shoppingListId)

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Shopping List : {shoppingList.name}</Text>
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

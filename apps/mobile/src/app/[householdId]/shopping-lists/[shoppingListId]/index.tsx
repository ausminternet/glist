import { Text, View } from 'react-native'
import { useCategories } from '@/api/categories/use-categories'
import { useShoppingListItems } from '@/api/shopping-lists'
import { useShoppingLists } from '@/api/shopping-lists/use-shopping-lists'
import { useShops } from '@/api/shops/use-shops'
import { useHouseholdId } from '@/utils/use-household-id'
import { useShoppingListId } from '@/utils/use-shopping-list-id'

export default function Index() {
  const householdId = useHouseholdId()
  const shoppingListId = useShoppingListId()
  const { getShoppingList } = useShoppingLists(householdId)
  const { getShopName } = useShops(householdId)
  const { getCategoryName } = useCategories(householdId)
  const { shoppingListItems } = useShoppingListItems(
    householdId,
    shoppingListId,
  )

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Shopping List : {getShoppingList(shoppingListId)?.name}</Text>
      {shoppingListItems.map((item) => (
        <Text key={item.id}>
          {item.name}, Shops:{' '}
          {item.shopIds.map((shopId) => getShopName(shopId)).join(', ')}
          Category: {item.categoryId ? getCategoryName(item.categoryId) : 'N/A'}
        </Text>
      ))}
    </View>
  )
}

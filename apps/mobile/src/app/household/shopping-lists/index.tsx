import { useLocalSearchParams } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { Button, Text, View } from 'react-native'
import { useCategories } from '@/api/categories'
import { useShoppingListEvents } from '@/api/events'
import {
  useCheckShoppingListItem,
  useShoppingListItems,
  useUncheckShoppingListItem,
} from '@/api/shopping-list-items'
import { useShops } from '@/api/shops'
import { useHouseholdId } from '@/provider/household-provider'

export default function Index() {
  const { shopId, withNoShop } = useLocalSearchParams<{
    shopId: string
    withNoShop: string
  }>()
  const householdId = useHouseholdId()

  const { shoppingListItems, getShoppingListItemsByShopId } =
    useShoppingListItems(householdId)
  const { getShopName } = useShops(householdId)
  const { getCategoryName } = useCategories(householdId)
  const { checkShoppingListItem } = useCheckShoppingListItem()
  const { uncheckShoppingListItem } = useUncheckShoppingListItem()

  useShoppingListEvents(householdId)

  const filteredShoppingListItems = shopId
    ? getShoppingListItemsByShopId(shopId, withNoShop === 'true')
    : shoppingListItems

  return (
    <>
      <Stack.Screen
        options={{
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Einkaufsliste</Text>
        {filteredShoppingListItems.map((item) => (
          <View key={item.id}>
            <Text>{item.name}</Text>
            <Text>checked: {item.checked ? 'Yes' : 'No'}</Text>
            <Text>
              Shops:{' '}
              {item.shopIds.map((shopId) => getShopName(shopId)).join(', ')}
            </Text>
            <Text>
              Category:{' '}
              {item.categoryId ? getCategoryName(item.categoryId) : 'N/A'}
            </Text>
            <View>
              {item.checked ? (
                <Button
                  onPress={() =>
                    uncheckShoppingListItem({
                      householdId,
                      itemId: item.id,
                    })
                  }
                  title="Uncheck"
                />
              ) : (
                <Button
                  onPress={() =>
                    checkShoppingListItem({
                      householdId,
                      itemId: item.id,
                    })
                  }
                  title="Check"
                />
              )}
            </View>
          </View>
        ))}
      </View>
    </>
  )
}

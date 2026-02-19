import { useLocalSearchParams } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { useColorScheme } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useShoppingListEvents } from '@/api/events'
import {
  useCheckShoppingListItem,
  useShoppingListItems,
  useUncheckShoppingListItem,
} from '@/api/shopping-list-items'
import { useShops } from '@/api/shops'
import { colors } from '@/components/colors'
import { List } from '@/components/list.components'
import { ListItem } from '@/components/list-item.component'

export default function Index() {
  const { shopId, withNoShop } = useLocalSearchParams<{
    shopId: string
    withNoShop: string
  }>()
  const colorTheme = useColorScheme()
  const { householdId } = useLocalSearchParams<{ householdId: string }>()
  const { shoppingListItems, getShoppingListItemsByShopId } =
    useShoppingListItems(householdId)
  const { getShopName } = useShops(householdId)
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
          title: 'Einkaufsliste',
          headerBackButtonDisplayMode: 'minimal',
          headerLargeTitleEnabled: true,
          contentStyle: {
            backgroundColor:
              colorTheme === 'dark' ? 'black' : colors.background.tertiary,
          },
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          gap: 24,
          flexDirection: 'column',
        }}
      >
        <List type="plain" backgroundColor="transparent">
          {filteredShoppingListItems.map((item) => (
            <ListItem
              key={item.id}
              onToggleCheckbox={() => {
                item.checked
                  ? uncheckShoppingListItem({ householdId, itemId: item.id })
                  : checkShoppingListItem({ householdId, itemId: item.id })
              }}
              checked={item.checked}
              subtitle={item.description}
              right={item.shopIds
                .map((shopId) => getShopName(shopId))
                .join(', ')}
            >
              {`${item.quantity ?? ''} ${item.name}`}
            </ListItem>
          ))}
        </List>
      </ScrollView>
    </>
  )
}

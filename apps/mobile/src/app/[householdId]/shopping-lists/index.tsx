import { useLocalSearchParams, useRouter } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { useColorScheme } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useShoppingListEvents } from '@/api/events'
import { useShoppingListItems } from '@/api/shopping-list-items'
import { colors } from '@/components/colors'
import { List } from '@/components/list.components'
import { ShoppingListItem } from '@/components/shopping-list-item-view'
import { useHouseholdId } from '@/hooks/use-household-id'

export default function Index() {
  const { shopId, withNoShop } = useLocalSearchParams<{
    shopId: string
    withNoShop: string
  }>()
  const router = useRouter()
  const colorTheme = useColorScheme()
  const householdId = useHouseholdId()
  const { shoppingListItems, getShoppingListItemsByShopId } =
    useShoppingListItems()

  useShoppingListEvents()

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
          unstable_headerRightItems: () => [
            {
              type: 'button',
              label: 'Neuer Eintrag',
              icon: {
                type: 'sfSymbol',
                name: 'plus',
              },
              variant: 'prominent',
              onPress: () => {
                router.push(`/${householdId}/modals/shopping-list-item`)
              },
            },
          ],
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
            <ShoppingListItem item={item} key={item.id} />
          ))}
        </List>
      </ScrollView>
    </>
  )
}

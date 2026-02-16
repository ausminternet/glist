import { Link, Stack } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { ScrollView, Switch } from 'react-native-gesture-handler'
import { useBootstrap } from '@/api/bootstrap'
import { useShoppingListItems } from '@/api/shopping-list-items'
import { useShops } from '@/api/shops'
import {
  useHouseholdContext,
  useHouseholdId,
} from '@/provider/household-provider'

export default function Index() {
  const [withNoShop, setWithNoShop] = useState(false)
  const householdId = useHouseholdId()
  const { error, isSuccess } = useBootstrap(householdId)
  const { getShoppingListItemCountByShopId, itemCounts } = useShoppingListItems(
    householdId,
    isSuccess,
  )
  const { shops } = useShops(householdId, isSuccess)
  const { clearHousehold } = useHouseholdContext()

  const handleSwitchHousehold = async () => {
    await clearHousehold()
  }

  const shopsWithItems = shops.filter(
    (shop) => getShoppingListItemCountByShopId(shop.id, false) > 0,
  )

  const shopsWithItemCount = shopsWithItems
    .map((shop) => ({
      ...shop,
      itemCount: getShoppingListItemCountByShopId(shop.id, withNoShop),
    }))
    .filter((shop) => shop.itemCount > 0)

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Error: {error.message}</Text>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Haushalt',
          headerLargeTitleEnabled: true,
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Haushalt: {householdId}</Text>
        <Link href={`/household/inventory`}>Inventar</Link>
        <View style={{ height: 10 }} />

        <Link href={`/household/shopping-lists`}>
          <Text>Einkaufsliste {itemCounts.all}</Text>
        </Link>

        <Text>NoShop? {withNoShop ? 'Ja' : 'Nein'}</Text>

        <Switch value={withNoShop} onValueChange={setWithNoShop} />

        {shopsWithItemCount.map((shop) => (
          <Link
            key={shop.id}
            href={`/household/shopping-lists?shopId=${shop.id}${withNoShop ? '&withNoShop=true' : ''}`}
          >
            <Text>
              {shop.name} {shop.itemCount}
            </Text>
          </Link>
        ))}

        <View style={{ height: 20 }} />

        <Pressable onPress={handleSwitchHousehold} style={{ padding: 10 }}>
          <Text style={{ color: 'gray' }}>Haushalt wechseln</Text>
        </Pressable>
      </ScrollView>
    </>
  )
}

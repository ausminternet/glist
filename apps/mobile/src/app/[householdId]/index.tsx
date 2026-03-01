import { useQueryClient } from '@tanstack/react-query'
import { SplashScreen, Stack, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'
import { useHousehold } from '@/api/households/use-household'
import { useInventoryItems } from '@/api/inventory-items'
import { useShoppingListItems } from '@/api/shopping-list-items'
import { useShops } from '@/api/shops'
import { colors } from '@/components/colors'
import { List } from '@/components/list.components'
import { ListHeader } from '@/components/list-header.component'
import { ListItem } from '@/components/list-item.component'
import { PersistedSwitch } from '@/components/persisted-switch.component'
import { useMinDuration } from '@/hooks/use-min-duration'
import { WITH_NO_SHOP_STORAGE_KEY } from '@/provider/storage-keys'

export default function Index() {
  const [withNoShop, setWithNoShop] = useState(false)
  const { householdId, hideSplash } = useLocalSearchParams<{
    householdId: string
    hideSplash?: string
  }>()
  const {
    getShoppingListItemCountByShopId,
    itemCounts,
    isPending: shoppingListPending,
  } = useShoppingListItems()
  const { inventoryItems, isPending: inventoryPending } = useInventoryItems()
  const { shops } = useShops()
  const { household } = useHousehold(householdId)
  const { isRunning, run } = useMinDuration()
  const queryClient = useQueryClient()

  const shopsWithItems = shops.filter(
    (shop) => getShoppingListItemCountByShopId(shop.id, false) > 0,
  )

  useEffect(() => {
    if (hideSplash === 'true') {
      setTimeout(() => SplashScreen.hide(), 1000)
    }
  }, [hideSplash])

  const shopsWithItemCount = shopsWithItems
    .map((shop) => ({
      ...shop,
      itemCount: getShoppingListItemCountByShopId(shop.id, withNoShop),
    }))
    .filter((shop) => shop.itemCount > 0)

  return (
    <>
      <Stack.Screen
        options={{
          title: household?.name || 'Haushalt',
          headerBackButtonDisplayMode: 'minimal',
          headerLargeTitleEnabled: true,
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          gap: 24,
          flexDirection: 'column',
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRunning}
            onRefresh={() => run(() => queryClient.refetchQueries())}
          />
        }
      >
        <List>
          <ListItem
            href={`/${householdId}/inventory`}
            icon="tray.circle.fill"
            iconSize={38}
            iconTintColor={colors.system.mint}
            right={
              inventoryPending ? <ActivityIndicator /> : inventoryItems.length
            }
          >
            Vorräte
          </ListItem>
        </List>

        <List>
          <ListItem
            href={`/${householdId}/shopping-lists`}
            icon="cart.circle.fill"
            iconSize={38}
            iconTintColor={colors.system.blue}
            right={
              shoppingListPending ? <ActivityIndicator /> : itemCounts.unchecked
            }
          >
            Einkaufsliste
          </ListItem>
        </List>

        <View>
          <ListHeader>Smarte Listen</ListHeader>
          <List>
            <ListItem
              right={
                <PersistedSwitch
                  storageKey={WITH_NO_SHOP_STORAGE_KEY}
                  onValueChange={setWithNoShop}
                />
              }
            >
              Inkl. Artikel ohne Geschäft
            </ListItem>
            {shopsWithItemCount.map((shop) => (
              <ListItem
                key={shop.id}
                right={shop.itemCount}
                href={`/${householdId}/shopping-lists?shopId=${shop.id}${withNoShop ? '&withNoShop=true' : ''}`}
              >
                {shop.name}
              </ListItem>
            ))}
          </List>
        </View>
      </ScrollView>
    </>
  )
}

import { useQueryClient } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'
import { useHousehold } from '@/api/households/use-household'
import { useInventoryItems } from '@/api/inventory-items'
import { useShoppingListItems } from '@/api/shopping-list-items'
import { useShops } from '@/api/shops'
import { colors } from '@/components/colors'
import { HouseholdSwitcher } from '@/components/household-switcher.component'
import { List } from '@/components/list.components'
import { ListItem } from '@/components/list-item.component'
import { PersistedSwitch } from '@/components/persisted-switch.component'
import { useHouseholdId } from '@/provider/household-provider'
import { WITH_NO_SHOP_STORAGE_KEY } from '@/provider/storage-keys'

export default function Index() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [withNoShop, setWithNoShop] = useState(false)
  const householdId = useHouseholdId()
  const {
    getShoppingListItemCountByShopId,
    itemCounts,
    isPending: shoppingListPending,
  } = useShoppingListItems(householdId)
  const { inventoryItems, isPending: inventoryPending } =
    useInventoryItems(householdId)
  const { shops } = useShops(householdId)
  const household = useHousehold(householdId)

  const queryClient = useQueryClient()

  const handleOnRefetch = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
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

  return (
    <>
      <Stack.Screen
        options={{
          title: household.name,
          headerLargeTitleEnabled: true,
          headerLeft: () => <HouseholdSwitcher />,
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 16,
          gap: 24,
          flexDirection: 'column',
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleOnRefetch}
          />
        }
      >
        <List>
          <ListItem
            title="Vorräte"
            href="/household/inventory"
            icon="tray.circle.fill"
            iconSize={38}
            iconTintColor={colors.system.mint}
            right={
              inventoryPending ? <ActivityIndicator /> : inventoryItems.length
            }
          />
        </List>

        <List>
          <ListItem
            title="Einkaufsliste"
            href="/household/shopping-lists"
            icon="cart.circle.fill"
            iconSize={38}
            iconTintColor={colors.system.blue}
            right={
              shoppingListPending ? <ActivityIndicator /> : itemCounts.unchecked
            }
          />
        </List>

        <View>
          <Text
            style={{
              fontSize: 18,
              marginBlockStart: 8,
              marginBlockEnd: 16,
              paddingLeft: 20,
              fontWeight: 'bold',
              color: colors.label.primary,
            }}
          >
            Smarte Listen
          </Text>
          <List>
            <ListItem
              title="Inkl. Artikel ohne Geschäft"
              right={
                <PersistedSwitch
                  storageKey={WITH_NO_SHOP_STORAGE_KEY}
                  onValueChange={setWithNoShop}
                />
              }
            />
            {shopsWithItemCount.map((shop) => (
              <ListItem
                key={shop.id}
                title={shop.name}
                right={shop.itemCount}
                href={`/household/shopping-lists?shopId=${shop.id}${withNoShop ? '&withNoShop=true' : ''}`}
              />
            ))}
          </List>
        </View>
      </ScrollView>
    </>
  )
}

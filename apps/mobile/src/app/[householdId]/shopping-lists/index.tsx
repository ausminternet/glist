import type { ShoppingListItemView } from '@glist/views'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { Alert, useColorScheme } from 'react-native'
import { useCategories } from '@/api/categories'
import { useShoppingListEvents } from '@/api/events'
import {
  useClearCheckedShoppingListItems,
  useShoppingListItems,
} from '@/api/shopping-list-items'
import { CategorySectionList } from '@/components/category-section-list'
import { colors } from '@/components/colors'
import { ListEmptyComponent } from '@/components/list-empty-component'
import { ShoppingListItem } from '@/components/shopping-list-item-view'
import { useHouseholdId } from '@/hooks/use-household-id'
import { groupItemsByCategory } from '@/utils/group-items-by-category'

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

  const { clearCheckedShoppingListItems } = useClearCheckedShoppingListItems()

  const { categories } = useCategories()

  useShoppingListEvents()

  const filteredShoppingListItems = shopId
    ? getShoppingListItemsByShopId(shopId, withNoShop === 'true')
    : shoppingListItems

  const shoppingListSectionData = groupItemsByCategory<ShoppingListItemView>(
    filteredShoppingListItems,
    categories,
    true,
  )

  const disableClearChecked = !filteredShoppingListItems.some(
    (item) => item.checked,
  )

  const handleOnClearAllCheckedShoppingListItems = () => {
    Alert.alert(
      'Abgehakte Einträge löschen',
      `Möchtest du wirklich alle abgehakten Einträge löschen?`,
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            clearCheckedShoppingListItems()
          },
        },
      ],
    )
  }

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
              label: 'gekaufte Items löschen',
              icon: {
                type: 'sfSymbol',
                name: 'checkmark.circle.badge.xmark',
              },
              variant: 'plain',
              onPress: handleOnClearAllCheckedShoppingListItems,
              disabled: disableClearChecked,
            },
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

      <CategorySectionList
        sections={shoppingListSectionData}
        renderItem={({ item }) => (
          <ShoppingListItem item={item} currentShopId={shopId} />
        )}
        ListEmptyItem={() => (
          <ListEmptyComponent
            title="Alles eingekauft"
            message="Tippe auf + um einen Eintrag hinzuzufügen"
          />
        )}
      />
    </>
  )
}

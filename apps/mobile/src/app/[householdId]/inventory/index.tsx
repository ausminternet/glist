import type { InventoryItemView } from '@glist/views'
import { useRouter } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { useColorScheme } from 'react-native'
import { useCategories } from '@/api/categories'
import { useInventoryItems } from '@/api/inventory-items'
import { CategorySectionList } from '@/components/category-section-list'
import { colors } from '@/components/colors'
import { InventoryItem } from '@/components/inventory-item-view'
import { ListEmptyComponent } from '@/components/list-empty-component'
import { useHouseholdId } from '@/hooks/use-household-id'
import { groupItemsByCategory } from '@/utils/group-items-by-category'

export default function Index() {
  const router = useRouter()
  const colorTheme = useColorScheme()
  const householdId = useHouseholdId()

  const { inventoryItems } = useInventoryItems()
  const { categories } = useCategories()

  const InventorySectionData = groupItemsByCategory<InventoryItemView>(
    inventoryItems,
    categories,
  )

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Vorräte',
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
              tintColor: colors.system.mint,
              onPress: () => {
                router.push(`/${householdId}/modals/inventory-item`)
              },
            },
          ],
        }}
      />
      <CategorySectionList
        sections={InventorySectionData}
        renderItem={({ item }) => <InventoryItem inventoryItem={item} />}
        ListEmptyItem={() => (
          <ListEmptyComponent
            title="Leerer Vorratsschrank"
            message="Tippe auf + um einen Eintrag hinzuzufügen"
          />
        )}
      />
    </>
  )
}

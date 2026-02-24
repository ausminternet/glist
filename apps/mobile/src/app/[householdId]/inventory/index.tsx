import { useRouter } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { useColorScheme } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useInventoryItems } from '@/api/inventory-items'
import { colors } from '@/components/colors'
import { InventoryItem } from '@/components/inventory-item-view'
import { List } from '@/components/list.components'
import { useHouseholdId } from '@/hooks/use-household-id'

export default function Index() {
  const router = useRouter()
  const colorTheme = useColorScheme()
  const householdId = useHouseholdId()

  const { inventoryItems } = useInventoryItems()

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
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          gap: 24,
          flexDirection: 'column',
        }}
      >
        <List type="plain" backgroundColor="transparent">
          {inventoryItems.map((item) => (
            <InventoryItem item={item} key={item.id} />
          ))}
        </List>
      </ScrollView>
    </>
  )
}

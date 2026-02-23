import { Stack, useLocalSearchParams } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { PlatformColor, ScrollView } from 'react-native'
import { useShops } from '@/api/shops'
import { List } from '@/components/list.components'
import { ListItem } from '@/components/list-item.component'
import { useShopsSelectionStore } from '@/stores/shops-selection'

export default function SelectShop() {
  const { householdId } = useLocalSearchParams<{ householdId: string }>()
  const { shops } = useShops(householdId)
  const { selectedShopIds, addShopId, removeShopId } = useShopsSelectionStore()

  const handleShopToggle = (shopId: string) => {
    if (selectedShopIds?.includes(shopId)) {
      removeShopId(shopId)
    } else {
      addShopId(shopId)
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Geschäfte auswählen',
          headerBackButtonDisplayMode: 'minimal',
          headerTransparent: true,
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: 24,
          flexDirection: 'column',
        }}
      >
        <List>
          {shops.map((shop) => (
            <ListItem
              key={shop.id}
              onPress={() => handleShopToggle(shop.id)}
              right={
                selectedShopIds?.includes(shop.id) ? (
                  <SymbolView
                    name="checkmark"
                    size={18}
                    tintColor={PlatformColor('systemBlue')}
                  />
                ) : undefined
              }
            >
              {shop.name}
            </ListItem>
          ))}
        </List>
      </ScrollView>
    </>
  )
}

import { getUnitLabel } from '@glist/shared'
import type { InventoryItemView } from '@glist/views'
import { useRouter } from 'expo-router'
import { ActionSheetIOS, Alert, Text, View } from 'react-native'
import { useDeleteInventoryItem } from '@/api/inventory-items'
import { useShops } from '@/api/shops'
import { useHouseholdId } from '@/hooks/use-household-id'
import { colors } from './colors'
import { ListItem } from './list-item.component'

export interface InventoryItemProps {
  item: InventoryItemView
}

export function InventoryItem({ item }: InventoryItemProps) {
  const householdId = useHouseholdId()
  const router = useRouter()
  const { shops } = useShops()
  const { deleteInventoryItem } = useDeleteInventoryItem()
  const { shoppingListItems } = useShoppingListItems()

  const isOnShoppingList = shoppingListItems.some(
    (shoppingListItem) => shoppingListItem.inventoryItemId === item.id,
  )

  const shopNames = shops
    .filter((shop) => item.shopIds.includes(shop.id))
    .map((s) => s.name)
    .join(', ')

  const itemEditUrl =
    `/${householdId}/modals/inventory-item?itemId=${item.id}` as const
  const addToShoppingListUrl =
    `/${householdId}/modals/shopping-list-item?inventoryItemId=${item.id}` as const

  const handleOnDelete = () => {
    Alert.alert(
      'Vorrat Löschen',
      `Möchtest du ${item.name} wirklich aus dem Vorrat löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => deleteInventoryItem(item.id),
        },
      ],
    )
  }

  const handleOnLongPress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: item.name,
        options: ['Abbrechen', 'Einkaufen', 'Bearbeiten', 'Löschen'],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 3,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) router.push(addToShoppingListUrl)
        if (buttonIndex === 2) router.push(itemEditUrl)
        if (buttonIndex === 3) handleOnDelete()
      },
    )
  }

  return (
    <ListItem
      icon={isOnShoppingList ? 'cart.fill' : 'cart'}
      iconTintColor={
        isOnShoppingList ? colors.system.blue : colors.label.tertiary
      }
      onLongPress={handleOnLongPress}
      right={
        <View
          style={{
            alignItems: 'flex-end',
            flexDirection: 'column',
            maxWidth: 150,
            gap: 6,
          }}
        >
          {item.targetStock !== null && (
            <Text
              style={{
                fontSize: 17,
                color: colors.label.secondary,
              }}
            >
              {item.targetStock.toLocaleString('de-DE')}{' '}
              {getUnitLabel(item.targetStockUnit, item.targetStock)}
            </Text>
          )}
          {shopNames && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: 15,
                color: colors.label.tertiary,
              }}
            >
              {shopNames}
            </Text>
          )}
        </View>
      }
      subtitle={item.description}
      href={addToShoppingListUrl}
      chevron={false}
    >
      {item.name}
    </ListItem>
  )
}

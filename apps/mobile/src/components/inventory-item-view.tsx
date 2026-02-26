import { getUnitLabel } from '@glist/shared'
import type { InventoryItemView } from '@glist/views'
import { useRouter } from 'expo-router'
import { Text, View } from 'react-native'
import { useShoppingListItems } from '@/api/shopping-list-items'
import { useShops } from '@/api/shops'
import { useHouseholdId } from '@/hooks/use-household-id'
import { colors } from './colors'
import { ListItem } from './list-item.component'

export interface InventoryItemProps {
  inventoryItem: InventoryItemView
}

export function InventoryItem({ inventoryItem }: InventoryItemProps) {
  const householdId = useHouseholdId()
  const router = useRouter()
  const { shops } = useShops()
  // const { deleteInventoryItem } = useDeleteInventoryItem()
  const { shoppingListItems } = useShoppingListItems()

  const shoppingListItem = shoppingListItems.find(
    (shoppingListItem) => shoppingListItem.inventoryItemId === inventoryItem.id,
  )

  const isOnShoppingList = shoppingListItem && !shoppingListItem.checked

  const shopNames = shops
    .filter((shop) => inventoryItem.shopIds.includes(shop.id))
    .map((s) => s.name)
    .join(', ')

  const itemEditUrl =
    `/${householdId}/modals/inventory-item?itemId=${inventoryItem.id}` as const

  const shoppingListItemUrl =
    `/${householdId}/modals/shopping-list-item?itemId=${shoppingListItem?.id}` as const

  const addToShoppingListUrl =
    `/${householdId}/modals/shopping-list-item?inventoryItemId=${inventoryItem.id}` as const

  // const handleOnDelete = () => {
  //   Alert.alert(
  //     'Vorrat Löschen',
  //     `Möchtest du ${inventoryItem.name} wirklich aus dem Vorrat löschen?`,
  //     [
  //       { text: 'Abbrechen', style: 'cancel' },
  //       {
  //         text: 'Löschen',
  //         style: 'destructive',
  //         onPress: () => deleteInventoryItem(inventoryItem.id),
  //       },
  //     ],
  //   )
  // }

  const handleOnLongPress = () => {
    router.push(itemEditUrl)
    //   ActionSheetIOS.showActionSheetWithOptions(
    //     {
    //       title: inventoryItem.name,
    //       options: ['Abbrechen', 'Einkaufen', 'Bearbeiten', 'Löschen'],
    //       cancelButtonIndex: 0,
    //       destructiveButtonIndex: 3,
    //     },
    //     (buttonIndex) => {
    //       if (buttonIndex === 1) router.push(addToShoppingListUrl)
    //       if (buttonIndex === 2) router.push(itemEditUrl)
    //       if (buttonIndex === 3) handleOnDelete()
    //     },
    //   )
  }

  return (
    <ListItem
      icon={isOnShoppingList ? 'cart.fill' : 'cart'}
      iconTintColor={
        isOnShoppingList ? colors.system.blue : colors.label.tertiary
      }
      iconSize={24}
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
          {inventoryItem.targetStock !== null && (
            <Text
              style={{
                fontSize: 17,
                color: colors.label.secondary,
              }}
            >
              {inventoryItem.targetStock.toLocaleString('de-DE')}{' '}
              {getUnitLabel(
                inventoryItem.targetStockUnit,
                inventoryItem.targetStock,
              )}
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
      subtitle={inventoryItem.description}
      href={isOnShoppingList ? shoppingListItemUrl : addToShoppingListUrl}
      chevron={false}
    >
      {inventoryItem.name}
    </ListItem>
  )
}

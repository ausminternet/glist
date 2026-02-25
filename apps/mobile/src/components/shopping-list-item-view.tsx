import { getUnitLabel } from '@glist/shared'
import type { ShoppingListItemView } from '@glist/views'
import { useRouter } from 'expo-router'
import { ActionSheetIOS, Alert, Text, View } from 'react-native'
import {
  useCheckShoppingListItem,
  useDeleteShoppingListItem,
  useUncheckShoppingListItem,
} from '@/api/shopping-list-items'
import { useShops } from '@/api/shops'
import { useHouseholdId } from '@/hooks/use-household-id'
import { colors } from './colors'
import { ListItem } from './list-item.component'

export interface ShoppingListItemProps {
  item: ShoppingListItemView
  currentShopId?: string
  currentShoppingListId?: string
}

export function ShoppingListItem({ item }: ShoppingListItemProps) {
  const householdId = useHouseholdId()
  const router = useRouter()
  const { shops } = useShops()

  const { checkShoppingListItem } = useCheckShoppingListItem()
  const { uncheckShoppingListItem } = useUncheckShoppingListItem()
  const { deleteShoppingListItem } = useDeleteShoppingListItem()

  const itemShops = shops?.filter((s) => item.shopIds?.includes(s.id))

  const itemEditUrl =
    `/${householdId}/modals/shopping-list-item?itemId=${item.id}` as const

  const handleOnDelete = () => {
    Alert.alert(
      'Eintrag Löschen',
      `Möchtest du ${item.name} wirklich von der Einkaufliste löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => deleteShoppingListItem(item.id),
        },
      ],
    )
  }

  const handleOnToggle = (checked: boolean) => {
    checked ? checkShoppingListItem(item.id) : uncheckShoppingListItem(item.id)
  }

  const handleOnLongPress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: item.name,
        options: ['Abbrechen', 'Bearbeiten', 'Löschen'],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 2,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) router.push(itemEditUrl)
        if (buttonIndex === 2) handleOnDelete()
      },
    )
  }

  const shopNames = itemShops.map((s) => s.name).join(', ')

  return (
    <ListItem
      onPress={() => handleOnToggle(!item.checked)}
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
          {item.quantity && (
            <Text
              style={{
                fontSize: 17,
                color: colors.label.secondary,
              }}
            >
              {item.quantity.toLocaleString('de-DE')}{' '}
              {getUnitLabel(item.quantityUnit, item.quantity)}
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
      onToggleCheckbox={handleOnToggle}
      checked={item.checked}
      chevron={false}
    >
      {item.name}
    </ListItem>
  )
}

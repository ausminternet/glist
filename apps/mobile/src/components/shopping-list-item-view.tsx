import { getUnitLabel } from '@glist/shared'
import type { ShoppingListItemView } from '@glist/views'
import { PlatformColor, Text, View } from 'react-native'
import {
  useCheckShoppingListItem,
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
  const { shops } = useShops()

  const { checkShoppingListItem } = useCheckShoppingListItem()
  const { uncheckShoppingListItem } = useUncheckShoppingListItem()
  // const { deleteShoppingListItem } = useDeleteShoppingListItem()

  const itemShops = shops?.filter((s) => item.shopIds?.includes(s.id))

  // const handleOnDelete = () => {
  //   Alert.alert('Löschen', 'Möchten Sie diesen Eintrag wirklich löschen?', [
  //     { text: 'Abbrechen', style: 'cancel' },
  //     {
  //       text: 'Löschen',
  //       style: 'destructive',
  //       onPress: () => deleteShoppingListItem(item),
  //     },
  //   ])
  // }
  //
  //

  const shopNames = itemShops.map((s) => s.name).join(', ')

  return (
    <ListItem
      right={
        <View
          style={{
            alignItems: 'flex-end',
            flexDirection: 'column',
            maxWidth: 150,
            gap: 6,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              color: PlatformColor('secondaryLabelColor'),
            }}
          >
            {item.quantity &&
              `${item.quantity.toLocaleString('de-DE')} ${getUnitLabel(
                item.quantityUnit,
                item.quantity,
              )}`}
          </Text>
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
      onToggleCheckbox={(checked: boolean) =>
        checked
          ? checkShoppingListItem(item.id)
          : uncheckShoppingListItem(item.id)
      }
      checked={item.checked}
      href={`/${householdId}/modals/shopping-list-item?itemId=${item.id}`}
      chevron={false}
    >
      {item.name}
    </ListItem>
  )
}

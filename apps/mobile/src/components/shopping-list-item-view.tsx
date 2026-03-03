import { getUnitAbbreviation } from '@glist/shared'
import type { ShoppingListItemView } from '@glist/views'
import { useRouter } from 'expo-router'
import { Text, View } from 'react-native'
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
  const router = useRouter()
  const { shops } = useShops()

  const { checkShoppingListItem } = useCheckShoppingListItem()
  const { uncheckShoppingListItem } = useUncheckShoppingListItem()

  const itemShops = shops?.filter((s) => item.shopIds?.includes(s.id))

  const shoppingListItemQuickViewUrl =
    `/${householdId}/sheets/shopping-list-item-quick-view?itemId=${item.id}` as const

  const handleOnToggle = (checked: boolean) => {
    checked ? checkShoppingListItem(item.id) : uncheckShoppingListItem(item.id)
  }

  const shopNames = itemShops.map((s) => s.name).join(', ')

  let title = item.name

  if (item.quantity) {
    title = `${item.quantity.toLocaleString('de-DE')} ${getUnitAbbreviation(item.quantityUnit)} ${item.name}`
  }

  return (
    <ListItem
      onPress={() => router.push(shoppingListItemQuickViewUrl)}
      right={
        <View
          style={{
            alignItems: 'flex-end',
            flexDirection: 'column',
            maxWidth: 150,
            gap: 6,
          }}
        >
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
      {title}
    </ListItem>
  )
}

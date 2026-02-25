import { getUnitLabel } from '@glist/shared'
import type { InventoryItemView } from '@glist/views'
import { Text, View } from 'react-native'
import { useShops } from '@/api/shops'
import { useHouseholdId } from '@/hooks/use-household-id'
import { colors } from './colors'
import { ListItem } from './list-item.component'

export interface InventoryItemProps {
  item: InventoryItemView
}

export function InventoryItem({ item }: InventoryItemProps) {
  const householdId = useHouseholdId()
  const { shops } = useShops()

  const shopNames = shops
    .filter((shop) => item.shopIds.includes(shop.id))
    .map((s) => s.name)
    .join(', ')

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
      href={`/${householdId}/modals/inventory-item?itemId=${item.id}`}
      chevron={false}
    >
      {item.name}
    </ListItem>
  )
}

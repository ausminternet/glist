import { getUnitLabel } from '@glist/shared'
import type { InventoryItemView } from '@glist/views'
import { PlatformColor, Text, View } from 'react-native'

interface LinkedInventoryInfoProps {
  inventoryItem: InventoryItemView
}

/**
 * Displays additional information about a linked inventory item.
 * Shows target stock and base price if available.
 */
export function LinkedInventoryInfo({
  inventoryItem,
}: LinkedInventoryInfoProps) {
  if (!!inventoryItem.targetStock && !!inventoryItem.basePriceCents) {
    return null
  }

  return (
    <View style={{ paddingInline: 20, gap: 2, marginTop: 6 }}>
      {!!inventoryItem.targetStock && (
        <Text
          style={{
            color: PlatformColor('secondaryLabel'),
          }}
        >
          {`Sollbestand: ${inventoryItem.targetStock} ${getUnitLabel(
            inventoryItem.targetStockUnit,
            inventoryItem.targetStock,
          )}`}
        </Text>
      )}
      {!!inventoryItem.basePriceCents && (
        <Text
          style={{
            color: PlatformColor('secondaryLabel'),
          }}
        >
          {`Basispreis: ${inventoryItem.basePriceCents
            .toString()
            .replace('.', ',')} € / ${getUnitLabel(
            inventoryItem.basePriceUnit,
            1,
          )}`}
        </Text>
      )}
    </View>
  )
}

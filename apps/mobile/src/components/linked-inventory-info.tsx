import { getUnitLabel } from '@glist/shared'
import type { InventoryItemView } from '@glist/views'
import { PlatformColor, Text, View } from 'react-native'
import { formatEuro } from '@/utils/currency'

interface LinkedInventoryInfoProps {
  inventoryItem: InventoryItemView
}

export function LinkedInventoryInfo({
  inventoryItem,
}: LinkedInventoryInfoProps) {
  if (!inventoryItem.targetStock && !inventoryItem.basePriceCents) {
    return null
  }

  return (
    <View style={{ paddingInline: 34, gap: 2, marginTop: 6 }}>
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
          {`Basispreis: ${formatEuro(
            inventoryItem.basePriceCents,
          )} € / ${getUnitLabel(inventoryItem.basePriceUnit, 1)}`}
        </Text>
      )}
    </View>
  )
}

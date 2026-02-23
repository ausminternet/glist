import type { InventoryItemView } from '@glist/views'
import { useState } from 'react'
import { Alert } from 'react-native'
import { useCategorySelectionStore } from '@/stores/category-selection'
import { useShopsSelectionStore } from '@/stores/shops-selection'
import type { SetShoppingListFormValue } from './use-shopping-list-item-form'

interface UseLinkedInventoryItemProps {
  householdId: string
  setValue: SetShoppingListFormValue
}

export function useLinkedInventoryItem({
  setValue,
}: UseLinkedInventoryItemProps) {
  const [inventoryItem, setInventoryItem] = useState<InventoryItemView | null>(
    null,
  )
  const { setSelectedCategoryId } = useCategorySelectionStore()
  const { setSelectedShopIds } = useShopsSelectionStore()

  const handleSelectInventoryItem = (
    item: InventoryItemView,
    onSuccess?: () => void,
  ) => {
    setInventoryItem(item)
    setValue('name', item.name)
    setValue('description', item.description ?? undefined)
    setValue('quantity', item.targetStock ?? undefined)
    setValue('quantityUnit', item.targetStockUnit ?? undefined)
    setSelectedCategoryId(item.categoryId)
    setSelectedShopIds(item.shopIds)

    onSuccess?.()
  }

  const handleUnselectInventoryItem = (
    onSucess?: () => void,
    onAbort?: () => void,
  ) => {
    Alert.alert(
      'Zurücksetzen',
      'Möchtest du die Verknüpfung zum Vorrat auflösen?',
      [
        { text: 'Abbrechen', style: 'cancel', onPress: onAbort },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: () => {
            setInventoryItem(null)
            onSucess?.()
          },
        },
      ],
    )
  }

  return {
    inventoryItem,
    linkInventoryItem: (item: InventoryItemView) => setInventoryItem(item),
    handleSelectInventoryItem,
    handleUnselectInventoryItem,
  }
}

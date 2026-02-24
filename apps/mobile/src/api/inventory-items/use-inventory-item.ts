import { useInventoryItems } from './use-inventory-items'

export function useInventoryItem(inventoryItemId: string | undefined) {
  const { inventoryItems } = useInventoryItems()

  return inventoryItemId
    ? inventoryItems.find((item) => item.id === inventoryItemId)
    : undefined
}

import { useInventoryItems } from './use-inventory-items'

export function useInventoryItem(inventoryItemId?: string) {
  const { inventoryItems, ...rest } = useInventoryItems()

  return {
    inventoryItem: inventoryItems.find((item) => item.id === inventoryItemId),
    ...rest,
  }
}

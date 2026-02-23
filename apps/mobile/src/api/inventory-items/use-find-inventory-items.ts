import { useInventoryItems } from './use-inventory-items'

export const useFindInventoryItems = () => {
  const { inventoryItems } = useInventoryItems()

  const searchInventoryItems = (search: string) => {
    if (!search || search.length < 2) {
      return []
    }

    const lowerSearch = search.toLowerCase()
    const result = inventoryItems.filter((item) =>
      item.name.toLowerCase().includes(lowerSearch),
    )

    return result
  }

  const findInventoryItemById = (id: string) => {
    return inventoryItems.find((item) => item.id === id)
  }

  return { searchInventoryItems, findInventoryItemById }
}

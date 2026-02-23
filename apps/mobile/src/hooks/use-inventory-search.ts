import { useCallback, useState } from 'react'
import { useFindInventoryItems, useInventoryItems } from '@/api/inventory-items'

/**
 * Custom hook that manages inventory item search functionality.
 * Handles search state, active search mode, and provides filtered results.
 */
export function useInventorySearch(householdId: string) {
  const [search, setSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState(true)

  const searchResults = useFindInventoryItems(search, householdId)
  const { inventoryItems: allInventoryItems } = useInventoryItems(householdId)

  const handleSearchChange = useCallback(
    (text: string) => {
      if (!activeSearch) return
      setSearch(text)
    },
    [activeSearch],
  )

  const disableActiveSearch = useCallback(() => {
    setActiveSearch(false)
  }, [])

  const enableActiveSearch = useCallback(() => {
    setActiveSearch(true)
  }, [])

  const clearSearch = useCallback(() => {
    setSearch('')
  }, [])

  const findInventoryItemById = useCallback(
    (id?: string | null) => {
      if (!id) return undefined
      return allInventoryItems.find((item) => item.id === id)
    },
    [allInventoryItems],
  )

  const showSearchResults = !search ? false : searchResults.length > 0

  return {
    search,
    searchResults,
    allInventoryItems,
    activeSearch,
    showSearchResults,
    handleSearchChange,
    disableActiveSearch,
    enableActiveSearch,
    clearSearch,
    findInventoryItemById,
  }
}

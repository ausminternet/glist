import type { ShoppingListView } from '@glist/views'
import { apiClient } from '../client'

export async function getShoppingLists(
  householdId: string,
): Promise<ShoppingListView[]> {
  const response = await apiClient<ShoppingListView[]>(
    `/households/${householdId}/shopping-lists`,
  )

  if (!response.success) {
    throw new Error(`Failed to fetch shopping lists: ${response.error}`)
  }

  return response.data
}

import type { ShoppingListItemView } from '@glist/views'
import { apiClient } from '../../client'

export async function getShoppingListItems(
  householdId: string,
  listId: string,
): Promise<ShoppingListItemView[]> {
  const response = await apiClient<ShoppingListItemView[]>(
    `/households/${householdId}/shopping-lists/${listId}/items`,
  )

  if (!response.success) {
    throw new Error(`Failed to fetch shopping list items: ${response.error}`)
  }

  return response.data
}

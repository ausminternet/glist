import { apiClient } from '../../client'

export async function uncheckShoppingListItem(
  householdId: string,
  listId: string,
  itemId: string,
): Promise<void> {
  const response = await apiClient(
    `/households/${householdId}/shopping-lists/${listId}/items/${itemId}/uncheck`,
    { method: 'POST' },
  )

  if (!response.success) {
    throw new Error(`Failed to uncheck shopping list item: ${response.error}`)
  }
}

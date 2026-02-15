import { apiClient } from '../../client'

export async function checkShoppingListItem(
  householdId: string,
  listId: string,
  itemId: string,
): Promise<void> {
  const response = await apiClient(
    `/households/${householdId}/shopping-lists/${listId}/items/${itemId}/check`,
    { method: 'POST' },
  )

  if (!response.success) {
    throw new Error(`Failed to check shopping list item: ${response.error}`)
  }
}

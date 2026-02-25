import { apiClient } from '../client'

export async function deleteShoppingListItem(
  householdId: string,
  itemId: string,
): Promise<void> {
  const response = await apiClient(
    `/households/${householdId}/shopping-list-items/${itemId}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.success) {
    throw new Error('Failed to delete shopping list item.')
  }
}

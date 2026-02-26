import { apiClient } from '../client'

export async function clearCheckedShoppingListItems(
  householdId: string,
): Promise<void> {
  const response = await apiClient(
    `/households/${householdId}/shopping-list-items/clear-checked`,
    {
      method: 'POST',
    },
  )

  if (!response.success) {
    throw new Error(
      `Failed to clear checked shopping list items: ${response.error}`,
    )
  }
}

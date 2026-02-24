import type { EditShoppingListItemInput } from '@glist/schemas'
import { apiClient } from '../client'

export async function editShoppingListItem(
  itemId: string,
  item: EditShoppingListItemInput,
  householdId: string,
): Promise<string> {
  const response = await apiClient<{ id: string }>(
    `/households/${householdId}/shopping-list-items/${itemId}/edit`,
    {
      method: 'PATCH',
      body: JSON.stringify(item),
    },
  )

  if (!response.success) {
    throw new Error(`Failed to update shopping list item: ${response.error}`)
  }

  return response.data.id
}

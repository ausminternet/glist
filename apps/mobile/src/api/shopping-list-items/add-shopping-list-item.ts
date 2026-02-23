import type { AddShoppingListItemInput } from '@glist/schemas'
import { apiClient } from '../client'

export async function addShoppingListItem(
  item: AddShoppingListItemInput,
  householdId: string,
): Promise<string> {
  const response = await apiClient<{ id: string }>(
    `/households/${householdId}/shopping-list-items`,
    {
      method: 'POST',
      body: JSON.stringify(item),
    },
  )

  if (!response.success) {
    throw new Error(`Failed to save shopping list item: ${response.error}`)
  }

  return response.data.id
}

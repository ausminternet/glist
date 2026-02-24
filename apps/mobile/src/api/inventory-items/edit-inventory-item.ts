import type { EditInventoryItemInput } from '@glist/schemas'
import { apiClient } from '../client'

export async function editInventoryItem(
  itemId: string,
  item: EditInventoryItemInput,
  householdId: string,
): Promise<void> {
  const response = await apiClient<{ id: string }>(
    `/households/${householdId}/inventory-items/${itemId}/edit`,
    {
      method: 'PATCH',
      body: JSON.stringify(item),
    },
  )

  // TODO: ResultPattern? Oder nicht, weil wegen reactqueryOnError
  if (!response.success) {
    throw new Error(`Failed to edit inventory item: ${response.error}`)
  }
}

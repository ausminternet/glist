import type { AddInventoryItemInput } from '@glist/schemas'
import { apiClient } from '../client'

export async function addInventoryItem(
  item: AddInventoryItemInput,
  householdId: string,
): Promise<string> {
  const response = await apiClient<{ id: string }>(
    `/households/${householdId}/inventory-items`,
    {
      method: 'POST',
      body: JSON.stringify(item),
    },
  )

  if (!response.success) {
    throw new Error(`Failed to add inventory item: ${response.error}`)
  }

  return response.data.id
}

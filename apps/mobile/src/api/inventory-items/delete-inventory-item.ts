import { apiClient } from '../client'

export async function deleteInventoryItem(
  householdId: string,
  itemId: string,
): Promise<void> {
  const response = await apiClient(
    `/households/${householdId}/inventory-items/${itemId}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.success) {
    throw new Error('Failed to delete inventory item.')
  }
}

import type { InventoryItemView } from '@glist/views'
import { apiClient } from '../client'

export async function getInventoryItems(
  householdId: string,
): Promise<InventoryItemView[]> {
  const response = await apiClient<InventoryItemView[]>(
    `/households/${householdId}/inventory-items`,
  )

  if (!response.success) {
    throw new Error(`Failed to fetch inventory items: ${response.error}`)
  }

  return response.data
}

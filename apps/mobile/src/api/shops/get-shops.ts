import type { ShopView } from '@glist/views'
import { apiClient } from '../client'

export async function getShops(householdId: string): Promise<ShopView[]> {
  const response = await apiClient<ShopView[]>(
    `/households/${householdId}/shops`,
  )

  if (!response.success) {
    throw new Error(`Failed to fetch shops: ${response.error}`)
  }

  return response.data
}

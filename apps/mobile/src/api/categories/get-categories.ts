import type { CategoryView } from '@glist/views'
import { apiClient } from '../client'

export async function getCategories(
  householdId: string,
): Promise<CategoryView[]> {
  const response = await apiClient<CategoryView[]>(
    `/households/${householdId}/categories`,
  )

  if (!response.success) {
    throw new Error(`Failed to fetch categories: ${response.error}`)
  }

  return response.data
}

import { apiClient } from '../client'

export type HouseholdView = {
  id: string
  name: string
}

export async function getHouseholds(): Promise<HouseholdView[]> {
  const response = await apiClient<HouseholdView[]>('/households')

  if (!response.success) {
    throw new Error(`Failed to fetch households: ${response.error}`)
  }

  return response.data
}

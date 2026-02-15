import type { BootstrapView } from '@glist/views'
import { apiClient } from '../client'

export async function getBootstrap(
  householdId: string,
): Promise<BootstrapView> {
  const response = await apiClient<BootstrapView>(
    `/households/${householdId}/bootstrap`,
  )

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

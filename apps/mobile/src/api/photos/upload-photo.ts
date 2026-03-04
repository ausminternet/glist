import { useMutation } from '@tanstack/react-query'
import { useHouseholdId } from '@/hooks/use-household-id'
import { apiClient } from '../client'

export type UploadPhotoResponse = {
  photoKey: string
  url: string
}

export type UploadPhotoParams = {
  uri: string
  mimeType: string
}

export const uploadPhoto = async (
  householdId: string,
  params: UploadPhotoParams,
): Promise<UploadPhotoResponse> => {
  const response = await fetch(params.uri)
  const blob = await response.blob()

  const res = await apiClient<UploadPhotoResponse>(
    `/households/${householdId}/photos`,
    {
      method: 'POST',
      body: blob,
      headers: {
        'Content-Type': params.mimeType,
      },
    },
  )

  if (!res.success) {
    throw new Error(res.error)
  }

  return res.data
}

export function useUploadPhoto() {
  const householdId = useHouseholdId()

  const { mutate, data, ...rest } = useMutation({
    mutationFn: (params: UploadPhotoParams) => uploadPhoto(householdId, params),
  })

  return { uploadPhoto: mutate, photo: data, ...rest }
}

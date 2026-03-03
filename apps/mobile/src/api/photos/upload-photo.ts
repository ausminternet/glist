import { useMutation } from '@tanstack/react-query'
import { useHouseholdId } from '@/hooks/use-household-id'
import { apiClient } from '../client'

export type UploadPhotoResponse = {
  photoKey: string
  url: string
}

export type UploadPhotoParams = {
  photoUri: string
  contentType: string
}

export const uploadPhoto = async (
  householdId: string,
  params: UploadPhotoParams,
): Promise<UploadPhotoResponse> => {
  const response = await fetch(params.photoUri)
  const blob = await response.blob()

  const res = await apiClient<UploadPhotoResponse>(
    `/households/${householdId}/photos`,
    {
      method: 'POST',
      body: blob,
      headers: {
        'Content-Type': params.contentType,
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

  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: UploadPhotoParams) => uploadPhoto(householdId, params),
  })

  return { uploadPhoto: mutateAsync, ...rest }
}

import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { useUploadPhoto as useUploadFotoHook } from '@/api/photos'

export function useUploadPhoto() {
  const { uploadPhoto, isPending } = useUploadFotoHook()
  const [photo, setPhoto] = useState<{ key: string; url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePickPhoto = async () => {
    setError(null)
    setPhoto(null)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      setError('Wir brauchen Zugriff auf deine Fotos.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      try {
        const uploaded = await uploadPhoto({
          photoUri: asset.uri,
          contentType: asset.mimeType ?? 'image/jpeg',
        })

        setPhoto({ key: uploaded.photoKey, url: uploaded.url })
      } catch (error) {
        setError(
          'Das Foto konnte nicht hochgeladen werden, bitte versuche es erneut.',
        )
        console.error(error)
      }
    }
  }

  const handleTakePhoto = async () => {
    setError(null)
    setPhoto(null)
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      setError('Wir brauchen Zugriff auf deine Kamera.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      try {
        const uploaded = await uploadPhoto({
          photoUri: asset.uri,
          contentType: asset.mimeType ?? 'image/jpeg',
        })

        setPhoto({ key: uploaded.photoKey, url: uploaded.url })
      } catch (error) {
        setError(
          'Das Foto konnte nicht hochgeladen werden, bitte versuche es erneut.',
        )
        console.error(error)
      }
    }
  }

  const clear = () => {
    setPhoto(null)
    setError(null)
  }

  return {
    handlePickPhoto,
    handleTakePhoto,
    error,
    isUploading: isPending,
    photo,
    clear,
  }
}

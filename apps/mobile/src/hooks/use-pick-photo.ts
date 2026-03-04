import * as ImagePicker from 'expo-image-picker'
import type { ImagePickerOptions } from 'expo-image-picker/src/ImagePicker.types'
import { useState } from 'react'

const IMAGE_OPTIONS: ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.8,
  allowsMultipleSelection: false,
}

export type PickedPhoto = {
  uri: string
  mimeType: string
}

export function usePickPhoto() {
  const [error, setError] = useState<string | null>(null)

  const pickPhoto = async () => {
    setError(null)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      setError('Wir brauchen Zugriff auf deine Fotos.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_OPTIONS)

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      return {
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
      }
    }
  }

  const takePhoto = async () => {
    setError(null)
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      setError('Wir brauchen Zugriff auf deine Kamera.')
      return
    }

    const result = await ImagePicker.launchCameraAsync(IMAGE_OPTIONS)

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      return {
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
      }
    }
  }

  return {
    pickPhoto,
    takePhoto,
    error,
  }
}

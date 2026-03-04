import { SymbolView } from 'expo-symbols'
import type { FC } from 'react'
import { Alert, Text, View } from 'react-native'
import Pressable from 'react-native-gesture-handler/src/mocks/Pressable'
import { type PickedPhoto, usePickPhoto } from '@/hooks/use-pick-photo'
import { colors } from './colors'

export interface PhotoPickerProps {
  label: string
  onPhotoPick?: (photo: PickedPhoto) => void
  fullWidth?: boolean
}

export const PhotoPicker: FC<PhotoPickerProps> = ({
  label,
  onPhotoPick,
  fullWidth,
}) => {
  const { pickPhoto, takePhoto } = usePickPhoto()

  const handlePickFoto = async () => {
    const photo = await pickPhoto()
    if (photo) {
      onPhotoPick?.(photo)
    }
  }

  const handleTakePhoto = async () => {
    const photo = await takePhoto()
    if (photo) {
      onPhotoPick?.(photo)
    }
  }

  const handleChooseMethod = () => {
    Alert.alert(
      'Foto auswählen',
      'Möchtest du ein Foto aus deiner Galerie auswählen oder ein neues Foto aufnehmen?',
      [
        { text: 'Galerie', onPress: handlePickFoto },
        { text: 'Kamera', onPress: handleTakePhoto },
        { text: 'Abbrechen', style: 'cancel' },
      ],
      { cancelable: true },
    )
  }

  return (
    <Pressable
      onPress={handleChooseMethod}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: fullWidth ? '100%' : 100,
        height: 100,
        borderWidth: 2,
        borderRadius: 8,
        borderColor: colors.separator.default,
        borderStyle: 'dashed',
      }}
    >
      <SymbolView
        name="photo.on.rectangle"
        size={32}
        tintColor={colors.label.secondary}
      />
      <Text
        style={{
          color: colors.label.secondary,
          fontSize: 13,
          fontWeight: 600,
          marginTop: 4,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

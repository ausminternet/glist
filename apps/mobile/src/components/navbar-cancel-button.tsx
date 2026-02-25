import { usePreventRemove } from '@react-navigation/native'
import { SymbolView } from 'expo-symbols'
import { type FC, useEffect, useState } from 'react'
import { Alert, PlatformColor } from 'react-native'
import { Pressable } from 'react-native-gesture-handler'

export interface NavbarCancelProps {
  preventRemove: boolean
  onCancel: () => void
  disabled?: boolean
}

export const NavbarCancelButton: FC<NavbarCancelProps> = ({
  preventRemove,
  onCancel,
  disabled,
}) => {
  const [_preventRemove, _setPreventRemove] = useState(preventRemove)

  useEffect(() => {
    _setPreventRemove(preventRemove)
  }, [preventRemove])

  usePreventRemove(preventRemove, () => handleOnCancel())

  const handleOnCancel = () => {
    if (!_preventRemove) {
      onCancel()
      return
    }

    Alert.alert(
      'Änderungen löschen',
      'Möchtest du den Vorgang wirklich abbrechen? Alle Änderungen gehen verloren.',
      [
        { text: 'Nein', style: 'cancel' },
        {
          text: 'Ja',
          style: 'destructive',
          onPress: () => {
            _setPreventRemove(false)
            onCancel()
          },
        },
      ],
    )
  }

  return (
    <Pressable onPress={handleOnCancel} disabled={disabled}>
      <SymbolView
        name="multiply"
        size={24}
        type="monochrome"
        tintColor={PlatformColor('label')}
        style={{ margin: 6 }}
      />
    </Pressable>
  )
}

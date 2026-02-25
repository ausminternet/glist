import { usePreventRemove } from '@react-navigation/native'
import { SymbolView } from 'expo-symbols'
import { type FC, useEffect, useState } from 'react'
import { Alert, PlatformColor } from 'react-native'
import { Pressable } from 'react-native-gesture-handler'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { colors } from './colors'

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

  if (preventRemove) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger disabled={disabled}>
          <Pressable>
            <SymbolView
              name="multiply"
              size={24}
              style={{ margin: 6 }}
              tintColor={colors.label.primary}
            />
          </Pressable>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.Label key="cancel">
            Möchtest du die Änderungen wirklich verwerfen?
          </DropdownMenu.Label>

          <DropdownMenu.Item
            key="discard"
            destructive
            style={{ fontWeight: 700 }}
            onSelect={() => {
              onCancel()
              _setPreventRemove(false)
              onCancel()
            }}
          >
            <DropdownMenu.ItemTitle>
              Änderungen verwerfen
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    )
  } else {
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
}

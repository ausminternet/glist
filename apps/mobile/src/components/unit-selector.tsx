import { getUnitLabel, UNIT_TYPES, type UnitType } from '@glist/shared'
import { SymbolView } from 'expo-symbols'
import { PlatformColor, Text } from 'react-native'
import { Pressable } from 'react-native-gesture-handler'
import * as DropdownMenu from 'zeego/dropdown-menu'

type labelType = 'singular' | 'plural' | 'combined'

export interface UnitSelectorProps {
  quantity?: number
  value?: UnitType
  label?: labelType
  onChange: (value: UnitType | undefined) => void
}

const getUnitLabelCount = (label: labelType): number | undefined => {
  switch (label) {
    case 'singular':
      return 1
    case 'plural':
      return 2
    default:
      return undefined
  }
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  value,
  onChange,
  label = 'combined',
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            backgroundColor: PlatformColor('tertiarySystemGroupedBackground'),
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 36,
            gap: 4,
            flexShrink: 0,
          }}
        >
          <Text
            style={{
              textAlign: 'right',
              fontSize: 17,
              color: value
                ? PlatformColor('label')
                : PlatformColor('secondaryLabel'),
            }}
          >
            {value ? getUnitLabel(value, getUnitLabelCount(label)) : 'wählen'}
          </Text>
          <SymbolView
            name="chevron.up.chevron.down"
            size={16}
            tintColor={PlatformColor('tertiaryLabel')}
          />
        </Pressable>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <DropdownMenu.Label>Einheit wählen</DropdownMenu.Label>
          <DropdownMenu.Item key="none" onSelect={() => onChange(undefined)}>
            <DropdownMenu.ItemTitle>Keine Einheit</DropdownMenu.ItemTitle>
            {/* <DropdownMenu.ItemIcon ios={{ name: 'xmark' }} /> */}
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          {UNIT_TYPES.map((unit) => (
            <DropdownMenu.Item key={unit} onSelect={() => onChange(unit)}>
              <DropdownMenu.ItemTitle>
                {getUnitLabel(unit, getUnitLabelCount(label))}
              </DropdownMenu.ItemTitle>
              {value === unit && (
                <DropdownMenu.ItemIcon ios={{ name: 'checkmark' }} />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

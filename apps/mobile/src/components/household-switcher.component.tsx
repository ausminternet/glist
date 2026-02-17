import { SymbolView } from 'expo-symbols'
import type { FC } from 'react'
import { PlatformColor } from 'react-native'
import { Pressable } from 'react-native-gesture-handler'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { useHouseholds } from '@/api/households/use-households'
import { useHouseholdContext } from '@/provider/household-provider'

export const HouseholdSwitcher: FC = () => {
  const { selectHousehold, householdId, clearHousehold } = useHouseholdContext()
  const { households } = useHouseholds()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Pressable>
          <SymbolView
            name="house"
            size={24}
            style={{ margin: 6 }}
            tintColor={PlatformColor('label')}
          />
        </Pressable>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Group>
          {/*<DropdownMenu.Item key="settings" onSelect={() => {}}>
            <DropdownMenu.ItemTitle>
              Einstellungen des Haushalts
            </DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon ios={{ name: 'gear' }} />
          </DropdownMenu.Item>*/}

          {households.length > 1 &&
            households.map((household) => (
              <DropdownMenu.Item
                key={household.id}
                onSelect={() => selectHousehold(household.id)}
              >
                <DropdownMenu.ItemTitle style={{ fontWeight: 'bold' }}>
                  {household.name}
                </DropdownMenu.ItemTitle>
                {household.id === householdId && (
                  <DropdownMenu.ItemIcon ios={{ name: 'checkmark' }} />
                )}
              </DropdownMenu.Item>
            ))}
        </DropdownMenu.Group>
        <DropdownMenu.Group>
          <DropdownMenu.Item key="clear" onSelect={() => clearHousehold()}>
            <DropdownMenu.ItemTitle>Haushaltsauswahl</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon ios={{ name: 'arrow.left.arrow.right' }} />
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

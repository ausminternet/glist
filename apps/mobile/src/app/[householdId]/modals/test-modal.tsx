import { Link, Stack, useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { ScrollView, Text } from 'react-native'
import { Pressable } from 'react-native-gesture-handler'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { colors } from '@/components/colors'

export default function Modal() {
  const router = useRouter()
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Test Modal',
          headerLargeTitleEnabled: true,
          unstable_headerRightItems: () => [
            {
              type: 'button',
              label: 'Save',
              icon: {
                type: 'sfSymbol',
                name: 'checkmark',
              },
              variant: 'prominent',
              onPress: () => {
                router.back()
              },
            },
          ],
          headerLeft: () => (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
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
                  onSelect={() => router.back()}
                >
                  <DropdownMenu.ItemTitle>
                    Änderungen verwerfen
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          gap: 24,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text style={{ color: colors.label.primary }}>Test Modal Content</Text>
        <Link href="/[householdId]/modals/page-two">
          <Text style={{ color: colors.label.primary }}>Go to Page Two</Text>
        </Link>
      </ScrollView>
    </>
  )
}

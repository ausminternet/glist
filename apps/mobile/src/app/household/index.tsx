import { Link, Stack } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useBootstrap } from '@/api/bootstrap'
import {
  useHouseholdContext,
  useHouseholdId,
} from '@/provider/household-provider'

export default function Index() {
  const householdId = useHouseholdId()
  const { error } = useBootstrap(householdId)
  const { clearHousehold } = useHouseholdContext()

  const handleSwitchHousehold = async () => {
    await clearHousehold()
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Error: {error.message}</Text>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Haushalt',
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Link href={`/household/inventory`}>Inventar</Link>
        <View style={{ height: 10 }} />

        <Link href={`/household/shopping-lists`}>
          <Text>Einkaufsliste</Text>
        </Link>

        <View style={{ height: 20 }} />

        <Pressable onPress={handleSwitchHousehold} style={{ padding: 10 }}>
          <Text style={{ color: 'gray' }}>Haushalt wechseln</Text>
        </Pressable>
      </View>
    </>
  )
}

import { Redirect } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useHouseholds } from '@/api/households/use-households'
import { useHouseholdContext } from '@/provider/household-provider'

export default function HouseholdsScreen() {
  const { households } = useHouseholds()
  const { selectHousehold, householdId, householdNotFound } =
    useHouseholdContext()

  if (householdId) {
    return <Redirect href="/household" />
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {householdNotFound && (
        <View
          style={{
            backgroundColor: '#fee2e2',
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: '#dc2626' }}>
            Haushalt wurde nicht gefunden
          </Text>
        </View>
      )}

      <Text style={{ fontSize: 20, marginBottom: 20 }}>Haushalt auswählen</Text>

      {households?.map((household) => (
        <Pressable
          key={household.id}
          onPress={() => selectHousehold(household.id)}
          style={{ padding: 10 }}
        >
          <Text>{household.name}</Text>
        </Pressable>
      ))}
    </View>
  )
}

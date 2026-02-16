import { Redirect } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useHouseholds } from '@/api/households/use-households'
import { useHouseholdContext } from '@/provider/household-provider'

export default function HouseholdsScreen() {
  const { households } = useHouseholds()
  const { selectHousehold, householdId } = useHouseholdContext()

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

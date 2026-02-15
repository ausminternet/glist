import { Link } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'
import { useHouseholds } from '@/api/households/use-households'

export default function HouseholdsScreen() {
  const { households, isLoading } = useHouseholds()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Haushalt auswählen</Text>
      {households?.map((household) => (
        <Link
          key={household.id}
          href={`/${household.id}/`}
          style={{ padding: 10 }}
        >
          <Text>{household.name}</Text>
        </Link>
      ))}
    </View>
  )
}

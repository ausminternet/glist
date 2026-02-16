import { Link } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'
import { useBootstrap } from '@/api/bootstrap'
import { useHouseholdId } from '@/utils/use-household-id'

export default function Index() {
  const householdId = useHouseholdId()
  const { isSuccess: isBootstrapComplete, isError } = useBootstrap(householdId)

  if (!isBootstrapComplete) {
    if (isError) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Fehler beim Laden</Text>
        </View>
      )
    }

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
      <Link href={`/${householdId}/inventory`}>Inventar</Link>
      <View style={{ height: 10 }} />

      <Link href={`/${householdId}/shopping-lists`}>
        <Text>Einkaufsliste</Text>
      </Link>
    </View>
  )
}

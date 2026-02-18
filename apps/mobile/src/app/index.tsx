import { useQueryClient } from '@tanstack/react-query'
import { Redirect } from 'expo-router'
import { useState } from 'react'
import { Button, Text, View } from 'react-native'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'
import { useHouseholds } from '@/api/households/use-households'
import { List } from '@/components/list.components'
import { ListItem } from '@/components/list-item.component'
import { useHouseholdContext } from '@/provider/household-provider'

export default function HouseholdsScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { households } = useHouseholds()
  const { selectHousehold, householdId, householdNotFound } =
    useHouseholdContext()

  const queryClient = useQueryClient()

  const handleOnRefetch = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries()
    setIsRefreshing(false)
  }

  if (householdId) {
    return <Redirect href="/household" />
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 16,
        gap: 24,
        flexDirection: 'column',
      }}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleOnRefetch} />
      }
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
      <View>
        <Button onPress={handleOnRefetch} title="Refetch" />
      </View>

      <List>
        {households.map((household) => (
          <ListItem
            key={household.id}
            onPress={() => selectHousehold(household.id)}
            title={household.name}
            subtitle={household.id}
          />
        ))}
      </List>
    </ScrollView>
  )
}

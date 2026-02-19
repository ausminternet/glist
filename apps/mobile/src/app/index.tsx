import { useQueryClient } from '@tanstack/react-query'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { Button, Text, View } from 'react-native'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'
import { useHouseholds } from '@/api/households/use-households'
import { List } from '@/components/list.components'
import { ListItem } from '@/components/list-item.component'
import { useHouseholdStorage } from '@/hooks/use-household-storage'
import { useMinDuration } from '@/hooks/use-min-duration'
import { clearHouseholdContentCaches } from '@/provider/query-client-provider'

SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({
  duration: 300,
  fade: true,
})

export default function HouseholdsScreen() {
  const { notFound } = useLocalSearchParams<{ notFound: string }>()
  const { households } = useHouseholds()
  const { saveHousehold, isLoading, householdId } = useHouseholdStorage()
  const { isRunning, run } = useMinDuration()
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleOnHouseHoldSelect = async (householdId: string) => {
    await saveHousehold(householdId)
    router.push(`/${householdId}`)
  }

  useEffect(() => {
    if (!isLoading && householdId) {
      router.push(`/${householdId}/?hideSplash=true`)
    }

    if (!isLoading && !householdId) {
      SplashScreen.hide()
    }
  }, [isLoading, router.push, householdId])

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Haushalte',
          headerLargeTitleEnabled: true,
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 16,
          gap: 24,
          flexDirection: 'column',
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRunning}
            onRefresh={() => run(() => queryClient.refetchQueries())}
          />
        }
      >
        {notFound && (
          <View
            style={{
              backgroundColor: '#fee2e2',
              padding: 16,
              borderRadius: 24,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: '#dc2626' }}>
              Haushalt wurde nicht gefunden
            </Text>
          </View>
        )}

        {__DEV__ && (
          <View
            style={{
              borderColor: '#f97316',
              borderRadius: 8,
              padding: 4,
            }}
          >
            <Button
              title="Haushaltsinhalte-Cache leeren"
              color="#f97316"
              onPress={clearHouseholdContentCaches}
            />
          </View>
        )}

        <List>
          {households.map((household) => (
            <ListItem
              key={household.id}
              onPress={() => handleOnHouseHoldSelect(household.id)}
              subtitle={household.id}
            >
              {household.name}
            </ListItem>
          ))}
        </List>
      </ScrollView>
    </>
  )
}

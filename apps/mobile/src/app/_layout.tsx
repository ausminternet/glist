import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { Stack } from 'expo-router'
import { ActivityIndicator, useColorScheme, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  HouseholdProvider,
  useHouseholdContext,
} from '@/provider/household-provider'
import { AppQueryClientProvider } from '@/provider/query-client-provider'

function RootNav() {
  const { householdId, isLoading } = useHouseholdContext()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Stack>
      <Stack.Protected guard={!householdId}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
      </Stack.Protected>

      <Stack.Protected guard={!!householdId}>
        <Stack.Screen
          name="household"
          options={{ headerShown: false, animation: 'fade' }}
        />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  return (
    <GestureHandlerRootView>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppQueryClientProvider>
          <HouseholdProvider>
            <RootNav />
          </HouseholdProvider>
        </AppQueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

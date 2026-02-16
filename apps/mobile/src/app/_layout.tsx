import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { HouseholdProvider } from '@/provider/household-provider'
import { AppQueryClientProvider } from '@/provider/query-client-provider'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  return (
    <GestureHandlerRootView>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppQueryClientProvider>
          <HouseholdProvider>
            <Stack>
              <Stack.Screen
                name="index"
                options={{ title: 'Haushalt auswählen', animation: 'fade' }}
              />
              <Stack.Screen
                name="household"
                options={{ headerShown: false, animation: 'fade' }}
              />
            </Stack>
          </HouseholdProvider>
        </AppQueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

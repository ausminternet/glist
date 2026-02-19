import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AppQueryClientProvider } from '@/provider/query-client-provider'

export default function RootLayout() {
  const colorScheme = useColorScheme()

  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme
  const themeValue = {
    ...theme,
    // https://github.com/expo/expo/issues/41743
    // https://github.com/expo/expo/issues/39969
    colors: {
      ...theme.colors,
      background: colorScheme === 'dark' ? 'transparent' : 'rgb(242, 242, 247)',
    },
  }

  return (
    <GestureHandlerRootView>
      <ThemeProvider value={themeValue}>
        <AppQueryClientProvider>
          <Stack>
            <Stack.Screen
              name="[householdId]/modals"
              options={{
                presentation: 'modal',
                headerLargeTitleEnabled: true,
                headerShown: false,
              }}
            />
          </Stack>
        </AppQueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

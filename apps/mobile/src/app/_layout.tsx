import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'
import { AppQueryClientProvider } from '@/provider/query-client-provider'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppQueryClientProvider>
        <Stack />
      </AppQueryClientProvider>
    </ThemeProvider>
  )
}

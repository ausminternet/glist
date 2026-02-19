import { Stack } from 'expo-router'
import { Text } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { colors } from '@/components/colors'

export default function PageTwo() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Page Two',
          headerLargeTitleEnabled: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          gap: 24,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text style={{ color: colors.label.primary }}>Page Two</Text>
      </ScrollView>
    </>
  )
}

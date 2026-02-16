import { Stack } from 'expo-router'

// Hier muss mindestens ein leerer Stack sein:
//https://github.com/expo/expo/issues/37305
export default function HouseholdLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="shopping-lists/index"
        options={{
          title: 'Einkaufsliste',
        }}
      />
      <Stack.Screen
        name="inventory/index"
        options={{
          title: 'Inventar',
        }}
      />
    </Stack>
  )
}

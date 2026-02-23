import { useLocalSearchParams } from 'expo-router'

export function useHouseholdId(): string {
  const { householdId } = useLocalSearchParams<{ householdId: string }>()

  if (!householdId) {
    throw new Error('householdId missing in route params')
  }

  return householdId
}

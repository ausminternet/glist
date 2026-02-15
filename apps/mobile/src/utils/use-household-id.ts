import { useLocalSearchParams } from 'expo-router'

export const useHouseholdId = () => {
  const { householdId } = useLocalSearchParams<{ householdId: string }>()

  if (!householdId) {
    throw new Error('householdId is required')
  }

  return householdId
}

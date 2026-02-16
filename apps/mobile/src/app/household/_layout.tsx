import { Redirect, Stack } from 'expo-router'
import { useHouseholdContext } from '@/provider/household-provider'

export default function HouseholdLayout() {
  const { householdId } = useHouseholdContext()

  if (!householdId) {
    return <Redirect href="/" />
  }

  return <Stack />
}

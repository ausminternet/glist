import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'
import { HOUSEHOLD_STORAGE_KEY } from '../provider/storage-keys'

const loadHousehold = async () => {
  try {
    return await AsyncStorage.getItem(HOUSEHOLD_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to load household from storage:', error)
    throw error
  }
}

const saveHousehold = async (householdId: string) => {
  try {
    await AsyncStorage.setItem(HOUSEHOLD_STORAGE_KEY, householdId)
  } catch (error) {
    console.error('Failed to save household to storage:', error)
    throw error
  }
}

export const useHouseholdStorage = () => {
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const id = await loadHousehold()
      setHouseholdId(id)
      setIsLoading(false)
    }
    load()
  }, [])

  const save = useCallback(async (id: string) => {
    await saveHousehold(id)
    setHouseholdId(id)
  }, [])

  return { householdId, saveHousehold: save, isLoading }
}

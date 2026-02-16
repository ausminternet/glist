import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { HOUSEHOLD_STORAGE_KEY } from './storage-keys'

interface HouseholdContextType {
  householdId: string | null
  isLoading: boolean
  householdNotFound: boolean
  selectHousehold: (id: string) => Promise<void>
  clearHousehold: (notFound?: boolean) => Promise<void>
}

const HouseholdContext = createContext<HouseholdContextType | null>(null)

export function useHouseholdContext() {
  const context = useContext(HouseholdContext)
  if (!context) {
    throw new Error(
      'useHouseholdContext must be used within a HouseholdProvider',
    )
  }
  return context
}

export function useHouseholdId() {
  const { householdId } = useHouseholdContext()

  if (!householdId) {
    throw new Error('No household selected')
  }

  return householdId
}

interface HouseholdProviderProps {
  children: ReactNode
}

export function HouseholdProvider({ children }: HouseholdProviderProps) {
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [householdNotFound, setHouseholdNotFound] = useState(false)

  useEffect(() => {
    async function loadHousehold() {
      try {
        const storedHouseholdId = await AsyncStorage.getItem(
          HOUSEHOLD_STORAGE_KEY,
        )
        setHouseholdId(storedHouseholdId)
      } catch (error) {
        console.error('Failed to load household from storage:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHousehold()
  }, [])

  const selectHousehold = useCallback(async (id: string) => {
    try {
      await AsyncStorage.setItem(HOUSEHOLD_STORAGE_KEY, id)
      setHouseholdId(id)
      setHouseholdNotFound(false)
    } catch (error) {
      console.error('Failed to save household to storage:', error)
      throw error
    }
  }, [])

  const clearHousehold = useCallback(async (notFound = false) => {
    try {
      await AsyncStorage.removeItem(HOUSEHOLD_STORAGE_KEY)
      setHouseholdId(null)
      setHouseholdNotFound(notFound)
    } catch (error) {
      console.error('Failed to clear household from storage:', error)
      throw error
    }
  }, [])

  return (
    <HouseholdContext.Provider
      value={{
        householdId,
        isLoading,
        householdNotFound,
        selectHousehold,
        clearHousehold,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  )
}

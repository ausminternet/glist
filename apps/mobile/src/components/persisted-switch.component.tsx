import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Switch } from 'react-native-gesture-handler'

interface PersistedSwitchProps {
  storageKey: string
  defaultValue?: boolean
  onValueChange?: (value: boolean) => void
}

export function PersistedSwitch({
  storageKey,
  defaultValue = false,
  onValueChange,
}: PersistedSwitchProps) {
  const [value, setValue] = useState(defaultValue)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((storedValue) => {
        if (storedValue !== null) {
          setValue(storedValue === 'true')
        }
      })
      .catch((error) => {
        console.error(`Failed to load ${storageKey} from storage:`, error)
      })
      .finally(() => {
        setIsLoaded(true)
      })
  }, [storageKey])

  const handleValueChange = (newValue: boolean) => {
    setValue(newValue)
    onValueChange?.(newValue)
    AsyncStorage.setItem(storageKey, String(newValue)).catch((error) => {
      console.error(`Failed to save ${storageKey} to storage:`, error)
    })
  }

  if (!isLoaded) {
    return <Switch value={defaultValue} disabled />
  }

  return <Switch value={value} onValueChange={handleValueChange} />
}

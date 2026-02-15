import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import {
  type PersistedClient,
  persistQueryClient,
} from '@tanstack/react-query-persist-client'
import type * as React from 'react'
import { AppState } from 'react-native'
import { REACT_QUERY_CLIENT_STORAGE_KEY } from './storage-keys'

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
})

persistQueryClient({
  queryClient: client,
  persister: {
    persistClient: async (clientState: PersistedClient) => {
      try {
        await AsyncStorage.setItem(
          REACT_QUERY_CLIENT_STORAGE_KEY,
          JSON.stringify(clientState),
        )
      } catch {}
    },
    restoreClient: async () => {
      try {
        const raw = await AsyncStorage.getItem(REACT_QUERY_CLIENT_STORAGE_KEY)
        return raw ? JSON.parse(raw) : undefined
      } catch {
        return undefined
      }
    },
    removeClient: async () => {
      try {
        await AsyncStorage.removeItem(REACT_QUERY_CLIENT_STORAGE_KEY)
      } catch {}
    },
  },
  maxAge: 24 * 60 * 60 * 1000, // 24h
})

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (status) => {
    handleFocus(status === 'active')
  })
  return () => subscription.remove()
})

export function AppQueryClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

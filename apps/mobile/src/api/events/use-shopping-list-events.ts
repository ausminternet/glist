import type { ShoppingListSSEEvent } from '@glist/shared'
import type { ShoppingListItemView } from '@glist/views'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import EventSource from 'react-native-sse'
import { queryKeys } from '../query-keys'

const API_URL = process.env.EXPO_PUBLIC_API_URL
const API_KEY = process.env.EXPO_PUBLIC_API_KEY

export function useShoppingListEvents(householdId: string, listId: string) {
  const queryClient = useQueryClient()
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const url = `${API_URL}/households/${householdId}/shopping-lists/${listId}/events`

    const es = new EventSource(url, {
      headers: {
        'x-api-key': API_KEY ?? '',
      },
    })

    eventSourceRef.current = es

    es.addEventListener('open', () => {
      console.log('[SSE] Connection opened')
    })

    es.addEventListener('message', (event) => {
      if (!event.data) return

      try {
        const data = JSON.parse(event.data) as ShoppingListSSEEvent
        const queryKey = queryKeys.shoppingListItems(householdId, listId)

        console.log(`[SSE] Received event: ${data.type}`)

        switch (data.type) {
          case 'connected':
            console.log('[SSE] Connected to shopping list events')
            break

          case 'ping':
            // Heartbeat received, connection is alive
            break

          case 'item-checked':
            queryClient.setQueryData<ShoppingListItemView[]>(queryKey, (old) =>
              old?.map((item) =>
                item.id === data.itemId ? { ...item, checked: true } : item,
              ),
            )
            break

          case 'item-unchecked':
            queryClient.setQueryData<ShoppingListItemView[]>(queryKey, (old) =>
              old?.map((item) =>
                item.id === data.itemId ? { ...item, checked: false } : item,
              ),
            )
            break

          case 'item-added':
          case 'item-removed':
          case 'item-updated':
            queryClient.invalidateQueries({ queryKey })
            break
        }
      } catch {
        // Ignore invalid JSON
      }
    })

    es.addEventListener('error', (event) => {
      if (event.type === 'error') {
        console.error('[SSE] Connection error:', event.message)
      }
    })

    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (nextAppState === 'active') {
          es.open()
        } else if (
          nextAppState === 'background' ||
          nextAppState === 'inactive'
        ) {
          es.close()
        }
      },
    )

    return () => {
      es.removeAllEventListeners()
      es.close()
      appStateSubscription.remove()
      console.log('[SSE] Disconnected')
    }
  }, [householdId, listId, queryClient])

  return {
    close: () => eventSourceRef.current?.close(),
  }
}

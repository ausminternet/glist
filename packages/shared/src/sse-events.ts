/**
 * SSE event types sent to clients.
 * These are the events that flow over the wire via Server-Sent Events.
 * They don't include listId since the SSE connection is already scoped to a specific list.
 */

export type ItemCheckedSSEEvent = { type: 'item-checked'; itemId: string }
export type ItemUncheckedSSEEvent = { type: 'item-unchecked'; itemId: string }
export type ItemAddedSSEEvent = { type: 'item-added'; itemId: string }
export type ItemRemovedSSEEvent = { type: 'item-removed'; itemId: string }
export type ItemUpdatedSSEEvent = { type: 'item-updated'; itemId: string }
export type ConnectedSSEEvent = { type: 'connected' }
export type PingSSEEvent = { type: 'ping' }

export type ShoppingListSSEEvent =
  | ConnectedSSEEvent
  | PingSSEEvent
  | ItemCheckedSSEEvent
  | ItemUncheckedSSEEvent
  | ItemAddedSSEEvent
  | ItemRemovedSSEEvent
  | ItemUpdatedSSEEvent

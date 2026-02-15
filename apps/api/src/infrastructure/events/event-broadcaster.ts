import type { ShoppingListDomainEvent } from '@/domain/shopping-list/events'
import { toSSEEvent } from './shopping-list-events-do'

export async function broadcastShoppingListEvent(
  env: CloudflareBindings,
  event: ShoppingListDomainEvent,
): Promise<void> {
  const id = env.SHOPPING_LIST_EVENTS.idFromName(event.listId)
  const stub = env.SHOPPING_LIST_EVENTS.get(id)

  await stub.fetch('http://internal/broadcast', {
    method: 'POST',
    body: JSON.stringify(toSSEEvent(event)),
  })
}

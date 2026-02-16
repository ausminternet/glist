import { DurableObject } from 'cloudflare:workers'
import type { ShoppingListSSEEvent } from '@glist/shared'
import type { ShoppingListDomainEvent } from '@/domain/shopping-list-item/events'

const HEARTBEAT_INTERVAL_MS = 30_000 // 30 seconds

export function toSSEEvent(
  domainEvent: ShoppingListDomainEvent,
): ShoppingListSSEEvent {
  switch (domainEvent.type) {
    case 'item-checked':
      return { type: 'item-checked', itemId: domainEvent.itemId }
    case 'item-unchecked':
      return { type: 'item-unchecked', itemId: domainEvent.itemId }
    case 'item-added':
      return { type: 'item-added', itemId: domainEvent.itemId }
    case 'item-removed':
      return { type: 'item-removed', itemId: domainEvent.itemId }
    case 'item-updated':
      return { type: 'item-updated', itemId: domainEvent.itemId }
  }
}

export class ShoppingListEventsDO extends DurableObject {
  private connections: Set<ReadableStreamDefaultController> = new Set()

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/subscribe') {
      return this.handleSubscribe()
    }

    if (url.pathname === '/broadcast') {
      const event = (await request.json()) as ShoppingListSSEEvent
      this.broadcast(event)
      return new Response('OK')
    }

    return new Response('Not found', { status: 404 })
  }

  // Durable Object alarm handler - sends heartbeat ping to all connected clients.
  async alarm(): Promise<void> {
    if (this.connections.size === 0) {
      return
    }

    this.broadcast({ type: 'ping' })
    await this.scheduleHeartbeat()
  }

  private async scheduleHeartbeat(): Promise<void> {
    const currentAlarm = await this.ctx.storage.getAlarm()
    if (currentAlarm === null) {
      await this.ctx.storage.setAlarm(Date.now() + HEARTBEAT_INTERVAL_MS)
    }
  }

  private async cancelHeartbeat(): Promise<void> {
    await this.ctx.storage.deleteAlarm()
  }

  private handleSubscribe(): Response {
    let controller: ReadableStreamDefaultController

    const stream = new ReadableStream({
      start: async (ctrl) => {
        controller = ctrl
        this.connections.add(controller)

        this.sendTo(controller, { type: 'connected' })

        if (this.connections.size === 1) {
          await this.scheduleHeartbeat()
        }
      },
      cancel: async () => {
        this.connections.delete(controller)

        if (this.connections.size === 0) {
          await this.cancelHeartbeat()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }

  private broadcast(event: ShoppingListSSEEvent): void {
    for (const controller of this.connections) {
      try {
        this.sendTo(controller, event)
      } catch {
        this.connections.delete(controller)
      }
    }
  }

  private sendTo(
    controller: ReadableStreamDefaultController,
    event: ShoppingListSSEEvent,
  ): void {
    const data = `data: ${JSON.stringify(event)}\n\n`
    controller.enqueue(new TextEncoder().encode(data))
  }
}

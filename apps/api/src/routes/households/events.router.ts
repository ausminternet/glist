import { Hono } from 'hono'
import type { HouseholdContext } from './context.js'

export const eventsRouter = new Hono<HouseholdContext>()

eventsRouter.get('/shopping-lists/:listId/events', async (c) => {
  const listId = c.req.param('listId')
  const id = c.env.SHOPPING_LIST_EVENTS.idFromName(listId)
  const stub = c.env.SHOPPING_LIST_EVENTS.get(id)

  const response = await stub.fetch('http://internal/subscribe')

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})

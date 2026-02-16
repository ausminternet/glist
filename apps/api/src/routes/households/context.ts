import { eq } from 'drizzle-orm'
import type { MiddlewareHandler } from 'hono'
import { createDb } from '@/infrastructure/persistence'
import { households } from '@/infrastructure/persistence/schema'

export type HouseholdContext = {
  Bindings: CloudflareBindings
  Variables: {
    householdId: string
  }
}

export const withHousehold: MiddlewareHandler<HouseholdContext> = async (
  c,
  next,
) => {
  const householdId = c.req.param('householdId')
  if (!householdId) {
    return c.json({ success: false, error: 'householdId missing' }, 400)
  }

  const db = createDb(c.env.glist_db)
  const household = await db
    .select({ id: households.id })
    .from(households)
    .where(eq(households.id, householdId))
    .get()

  if (!household) {
    return c.json({ success: false, error: 'Household not found' }, 404)
  }

  c.set('householdId', householdId)
  await next()
}

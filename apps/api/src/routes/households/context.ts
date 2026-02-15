import type { MiddlewareHandler } from 'hono'

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

  c.set('householdId', householdId)
  await next()
}

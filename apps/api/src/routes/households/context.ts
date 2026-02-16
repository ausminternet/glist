import type { MiddlewareHandler } from 'hono'
import {
  type HouseholdId,
  parseHouseholdId,
} from '@/domain/household/household-id'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleHouseholdQueryRepository } from '@/infrastructure/repositories/drizzle-household-query-repository'

export type HouseholdContext = {
  Bindings: CloudflareBindings
  Variables: {
    householdId: HouseholdId
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
  const householdQueryRepository = new DrizzleHouseholdQueryRepository(db)
  const household = await householdQueryRepository.find(householdId)

  if (!household) {
    return c.json({ success: false, error: 'Household not found' }, 404)
  }

  c.set('householdId', parseHouseholdId(householdId))
  await next()
}

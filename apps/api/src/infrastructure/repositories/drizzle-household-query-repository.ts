import type { HouseholdView } from '@glist/views'
import { eq } from 'drizzle-orm'
import type { HouseholdQueryRepository } from '@/domain/household/household-query-repository'
import type { Database } from '../persistence'
import { households } from '../persistence/schema'

type HouseholdRow = typeof households.$inferSelect

function householdToView(row: HouseholdRow): HouseholdView {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  }
}

export class DrizzleHouseholdQueryRepository
  implements HouseholdQueryRepository
{
  constructor(private db: Database) {}

  async find(id: string): Promise<HouseholdView | null> {
    const row = await this.db
      .select()
      .from(households)
      .where(eq(households.id, id))
      .get()

    if (!row) {
      return null
    }

    return householdToView(row)
  }

  async getAll(): Promise<HouseholdView[]> {
    const rows = await this.db
      .select()
      .from(households)
      .orderBy(households.name)

    return rows.map(householdToView)
  }
}

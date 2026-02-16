import { eq } from 'drizzle-orm'
import { Household, type HouseholdProps } from '@/domain/household/household'
import { parseHouseholdId } from '@/domain/household/household-id'
import type { HouseholdRepository } from '@/domain/household/household-repository'
import type { Database } from '@/infrastructure/persistence'
import { households } from '@/infrastructure/persistence/schema'

type HouseholdRow = typeof households.$inferSelect

function toDomain(row: HouseholdRow): Household {
  const props: HouseholdProps = {
    id: parseHouseholdId(row.id),
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? null,
  }

  return new Household(props)
}

function toSchema(household: Household): typeof households.$inferInsert {
  return {
    id: household.id,
    name: household.name,
    createdAt: household.createdAt,
    updatedAt: household.updatedAt,
  }
}

export class DrizzleHouseholdRepository implements HouseholdRepository {
  constructor(private db: Database) {}

  async save(household: Household): Promise<void> {
    const schema = toSchema(household)

    await this.db
      .insert(households)
      .values(schema)
      .onConflictDoUpdate({
        target: households.id,
        set: {
          name: schema.name,
          updatedAt: schema.updatedAt,
        },
      })
  }

  async find(id: string): Promise<Household | null> {
    const row = await this.db
      .select()
      .from(households)
      .where(eq(households.id, id))
      .get()

    if (!row) {
      return null
    }

    return toDomain(row)
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(households).where(eq(households.id, id))
  }
}

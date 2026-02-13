import { CategoryQueryRepository } from '@/domain/category/category-query-repository'
import { CategoryView } from '@glist/views'
import { asc, eq } from 'drizzle-orm'
import { Database } from '../persistence'
import { categories } from '../persistence/schema'

type CategoryRow = typeof categories.$inferSelect

function categoryRowToView(row: CategoryRow): CategoryView {
  return {
    id: row.id,
    householdId: row.householdId,
    name: row.name,
    createdAt: row.createdAt!.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  }
}

export class DrizzleCategoryQueryRepository implements CategoryQueryRepository {
  constructor(private db: Database) {}

  async findAllByHouseholdId(householdId: string): Promise<CategoryView[]> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.householdId, householdId))
      .orderBy(asc(categories.sortOrder))

    return rows.map(categoryRowToView)
  }
}

import { CategoryDtoRepository } from '@/domain/category/category-dto-repository'
import { CategoryDto } from '@glist/dtos'
import { asc, eq } from 'drizzle-orm'
import { Database } from '../persistence'
import { categories } from '../persistence/schema'

type CategoryRow = typeof categories.$inferSelect

function categoryRowToDto(row: CategoryRow): CategoryDto {
  return {
    id: row.id,
    householdId: row.householdId,
    name: row.name,
    createdAt: row.createdAt!.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  }
}

export class DrizzleCategoryDtoRepository implements CategoryDtoRepository {
  constructor(private db: Database) {}

  async findAllByHouseholdId(householdId: string): Promise<CategoryDto[]> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.householdId, householdId))
      .orderBy(asc(categories.sortOrder))

    return rows.map(categoryRowToDto)
  }
}

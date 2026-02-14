import { asc, eq } from 'drizzle-orm'
import { Category, type CategoryProps } from '@/domain/category/category'
import { parseCategoryId } from '@/domain/category/category-id'
import type { CategoryRepository } from '@/domain/category/category-repository'
import { parseHouseholdId } from '@/domain/shared/household-id'
import type { Database } from '@/infrastructure/persistence'
import { categories } from '@/infrastructure/persistence/schema'

type CategoryRow = typeof categories.$inferSelect

function toDomain(row: CategoryRow): Category {
  const props: CategoryProps = {
    id: parseCategoryId(row.id),
    householdId: parseHouseholdId(row.householdId),
    name: row.name,
    sortOrder: row.sortOrder ?? 1000.0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }

  return new Category(props)
}

function toSchema(category: Category): typeof categories.$inferInsert {
  return {
    id: category.id,
    householdId: category.householdId,
    name: category.name,
    sortOrder: category.sortOrder,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

export class DrizzleCategoryRepository implements CategoryRepository {
  constructor(private db: Database) {}

  async save(category: Category): Promise<void> {
    const categorySchema = toSchema(category)

    await this.db
      .insert(categories)
      .values(categorySchema)
      .onConflictDoUpdate({
        target: categories.id,
        set: {
          name: categorySchema.name,
          sortOrder: categorySchema.sortOrder,
          updatedAt: categorySchema.updatedAt,
        },
      })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(categories).where(eq(categories.id, id))
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .get()

    if (!row) {
      return null
    }

    return toDomain(row)
  }

  async findAllByHouseholdId(householdId: string): Promise<Category[]> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.householdId, householdId))
      .orderBy(asc(categories.sortOrder))

    return rows.map(toDomain)
  }
}

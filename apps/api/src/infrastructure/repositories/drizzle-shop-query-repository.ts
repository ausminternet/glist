import { ShopQueryRepository } from '@/domain/shop/shop-query-repository'
import { ShopView } from '@glist/views'
import { asc, eq } from 'drizzle-orm'
import { Database } from '../persistence'
import { shops } from '../persistence/schema'

type ShopRow = typeof shops.$inferSelect

function shopRowToView(row: ShopRow): ShopView {
  return {
    id: row.id,
    householdId: row.householdId,
    name: row.name,
    createdAt: row.createdAt!.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  }
}

export class DrizzleShopQueryRepository implements ShopQueryRepository {
  constructor(private db: Database) {}

  async findAllByHouseholdId(householdId: string): Promise<ShopView[]> {
    const rows = await this.db
      .select()
      .from(shops)
      .where(eq(shops.householdId, householdId))
      .orderBy(asc(shops.sortOrder))

    return rows.map(shopRowToView)
  }
}

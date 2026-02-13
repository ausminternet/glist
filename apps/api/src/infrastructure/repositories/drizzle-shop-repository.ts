import { parseHouseholdId } from '@/domain/shared/household-id';
import { Shop, ShopProps } from '@/domain/shop/shop';
import { parseShopId } from '@/domain/shop/shop-id';
import { ShopRepository } from '@/domain/shop/shop-repository';
import { Database } from '@/infrastructure/persistence';
import { shops } from '@/infrastructure/persistence/schema';
import { asc, eq } from 'drizzle-orm';

type ShopRow = typeof shops.$inferSelect

function toDomain(row: ShopRow): Shop {
  const props: ShopProps = {
    id: parseShopId(row.id),
    householdId: parseHouseholdId(row.householdId),
    name: row.name,
    sortOrder: row.sortOrder ?? 1000.0,
    createdAt: row.createdAt!,
    updatedAt: row.updatedAt,
  }

  return new Shop(props)
}

function toSchema(shop: Shop): typeof shops.$inferInsert {
  return {
    id: shop.id,
    householdId: shop.householdId,
    name: shop.name,
    sortOrder: shop.sortOrder,
    createdAt: shop.createdAt,
    updatedAt: shop.updatedAt,
  }
}

export class DrizzleShopRepository implements ShopRepository {
  constructor(private db: Database) {}

  async save(shop: Shop): Promise<void> {
    const shopSchema = toSchema(shop)

    await this.db
      .insert(shops)
      .values(shopSchema)
      .onConflictDoUpdate({
        target: shops.id,
        set: {
          name: shopSchema.name,
          sortOrder: shopSchema.sortOrder,
          updatedAt: shopSchema.updatedAt,
        },
      })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(shops).where(eq(shops.id, id))
  }

  async findById(id: string): Promise<Shop | null> {
    const row = await this.db
      .select()
      .from(shops)
      .where(eq(shops.id, id))
      .get()

    if (!row) {
      return null
    }

    return toDomain(row)
  }

  async findAllByHouseholdId(householdId: string): Promise<Shop[]> {
    const rows = await this.db
      .select()
      .from(shops)
      .where(eq(shops.householdId, householdId))
      .orderBy(asc(shops.sortOrder))

    return rows.map(toDomain)
  }
}

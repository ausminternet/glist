import { ShopDtoRepository } from '@/domain/shop/shop-dto-repository';
import { ShopDto } from '@glist/dtos';
import { asc, eq } from 'drizzle-orm';
import { Database } from '../persistence';
import { shops } from '../persistence/schema';

type ShopRow = typeof shops.$inferSelect

function shopRowToDto(row: ShopRow): ShopDto {
  return {
    id: row.id,
    householdId: row.householdId,
    name: row.name,
    createdAt: row.createdAt!.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  }
}

export class DrizzleShopDtoRepository implements ShopDtoRepository {
  constructor(private db: Database) {}

  async findAllByHouseholdId(householdId: string): Promise<ShopDto[]> {
    const rows = await this.db
      .select()
      .from(shops)
      .where(eq(shops.householdId, householdId))
      .orderBy(asc(shops.sortOrder))

    return rows.map(shopRowToDto)
  }
}

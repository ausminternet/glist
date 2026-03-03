import type { ShoppingListItemView } from '@glist/views'
import { eq, inArray } from 'drizzle-orm'
import type { ShoppingListItemQueryRepository } from '@/domain/shopping-list-item/shopping-list-item-query-repository'
import type { Database } from '../persistence'
import {
  shoppingListItemPhotos,
  shoppingListItemShops,
  shoppingListItems,
} from '../persistence/schema'
import { getPhotoUrl } from '../storage/photo-storage'

type ShoppingListItemRow = typeof shoppingListItems.$inferSelect

function shoppingListItemToView(
  itemRow: ShoppingListItemRow,
  shopIds: string[],
  photoKeys: string[],
  photoUrlBase: string,
): ShoppingListItemView {
  return {
    id: itemRow.id,
    householdId: itemRow.householdId,
    name: itemRow.name,
    description: itemRow.description,
    categoryId: itemRow.categoryId,
    quantity: itemRow.quantity,
    quantityUnit: itemRow.quantityUnit,
    checked: itemRow.checked,
    createdAt: itemRow.createdAt.toISOString(),
    updatedAt: itemRow.updatedAt?.toISOString() ?? null,
    inventoryItemId: itemRow.inventoryItemId,
    shopIds,
    photoUrls: photoKeys.map((key) => getPhotoUrl(key, photoUrlBase)),
    photoKeys,
  }
}

export class DrizzleShoppingListItemQueryRepository
  implements ShoppingListItemQueryRepository
{
  constructor(
    private db: Database,
    private photoUrlBase: string,
  ) {}

  async find(id: string): Promise<ShoppingListItemView | null> {
    const row = await this.db
      .select()
      .from(shoppingListItems)
      .where(eq(shoppingListItems.id, id))
      .get()

    if (!row) {
      return null
    }

    const shopAssociations = await this.db
      .select()
      .from(shoppingListItemShops)
      .where(eq(shoppingListItemShops.shoppingListItemId, id))

    const shopIds = shopAssociations.map((r) => r.shopId)

    const photoAssociations = await this.db
      .select()
      .from(shoppingListItemPhotos)
      .where(eq(shoppingListItemPhotos.shoppingListItemId, id))

    const photoKeys = photoAssociations.map((r) => r.photoKey)

    return shoppingListItemToView(row, shopIds, photoKeys, this.photoUrlBase)
  }

  async getAll(householdId: string): Promise<ShoppingListItemView[]> {
    const rows = await this.db
      .select()
      .from(shoppingListItems)
      .where(eq(shoppingListItems.householdId, householdId))
      .orderBy(shoppingListItems.createdAt)

    if (rows.length === 0) {
      return []
    }

    const itemIds = rows.map((row) => row.id)
    const shopAssociations = await this.db
      .select()
      .from(shoppingListItemShops)
      .where(inArray(shoppingListItemShops.shoppingListItemId, itemIds))

    const shopsByItemId = new Map<string, string[]>()
    for (const row of shopAssociations) {
      const shops = shopsByItemId.get(row.shoppingListItemId) ?? []
      shops.push(row.shopId)
      shopsByItemId.set(row.shoppingListItemId, shops)
    }

    const photoAssociations = await this.db
      .select()
      .from(shoppingListItemPhotos)
      .where(inArray(shoppingListItemPhotos.shoppingListItemId, itemIds))

    const photoKeysByItemId = new Map<string, string[]>()
    for (const row of photoAssociations) {
      const keys = photoKeysByItemId.get(row.shoppingListItemId) ?? []
      keys.push(row.photoKey)
      photoKeysByItemId.set(row.shoppingListItemId, keys)
    }

    return rows.map((row) =>
      shoppingListItemToView(
        row,
        shopsByItemId.get(row.id) ?? [],
        photoKeysByItemId.get(row.id) ?? [],
        this.photoUrlBase,
      ),
    )
  }
}

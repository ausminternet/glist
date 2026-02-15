import type { ShoppingListView } from '@glist/views'
import { eq } from 'drizzle-orm'
import type { ShoppingListQueryRepository } from '@/domain/shopping-list/shopping-list-query-repository'
import type { Database } from '../persistence'
import { shoppingLists } from '../persistence/schema'

type ShoppingListRow = typeof shoppingLists.$inferSelect

function shoppingListToView(listRow: ShoppingListRow): ShoppingListView {
  return {
    id: listRow.id,
    householdId: listRow.householdId,
    name: listRow.name,
    createdAt: listRow.createdAt.toISOString(),
    updatedAt: listRow.updatedAt?.toISOString() ?? null,
  }
}

export class DrizzleShoppingListQueryRepository
  implements ShoppingListQueryRepository
{
  constructor(private db: Database) {}

  async findAllByHouseholdId(householdId: string): Promise<ShoppingListView[]> {
    const listRows = await this.db
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.householdId, householdId))

    return listRows.map(shoppingListToView)
  }

  async find(listId: string): Promise<ShoppingListView> {
    const listRow = await this.db
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.id, listId))
      .limit(1)
      .get()

    if (!listRow) {
      throw new Error(`Shopping list with id ${listId} not found`)
    }

    return shoppingListToView(listRow)
  }
}

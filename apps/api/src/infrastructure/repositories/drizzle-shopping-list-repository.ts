import { count, eq } from 'drizzle-orm'
import { parseHouseholdId } from '@/domain/shared/household-id'
import {
  ShoppingList,
  type ShoppingListProps,
} from '@/domain/shopping-list/shopping-list'
import { parseShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'
import type { Database } from '@/infrastructure/persistence'
import { shoppingLists } from '@/infrastructure/persistence/schema'

type ShoppingListRow = typeof shoppingLists.$inferSelect

function toDomain(row: ShoppingListRow): ShoppingList {
  const props: ShoppingListProps = {
    id: parseShoppingListId(row.id),
    householdId: parseHouseholdId(row.householdId),
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }

  return new ShoppingList(props)
}

function toSchema(list: ShoppingList): typeof shoppingLists.$inferInsert {
  return {
    id: list.id,
    householdId: list.householdId,
    name: list.name,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }
}

export class DrizzleShoppingListRepository implements ShoppingListRepository {
  constructor(private db: Database) {}

  async save(shoppingList: ShoppingList): Promise<void> {
    const schema = toSchema(shoppingList)

    await this.db
      .insert(shoppingLists)
      .values(schema)
      .onConflictDoUpdate({
        target: shoppingLists.id,
        set: {
          name: schema.name,
          updatedAt: schema.updatedAt,
        },
      })
  }

  async findById(id: string): Promise<ShoppingList | null> {
    const row = await this.db
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.id, id))
      .get()

    if (!row) {
      return null
    }

    return toDomain(row)
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(shoppingLists).where(eq(shoppingLists.id, id))
  }

  async countByHouseholdId(householdId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(shoppingLists)
      .where(eq(shoppingLists.householdId, householdId))
      .get()

    return result?.count ?? 0
  }
}

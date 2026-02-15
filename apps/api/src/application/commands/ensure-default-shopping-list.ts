import type { ShoppingListWithItemsView } from '@glist/views'
import { parseHouseholdId } from '@/domain/shared/household-id'
import { ShoppingList } from '@/domain/shopping-list/shopping-list'
import { generateShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import type { ShoppingListRepository } from '@/domain/shopping-list/shopping-list-repository'

const DEFAULT_SHOPPING_LIST_NAME = 'Einkaufsliste'

export type EnsureDefaultShoppingListCommand = {
  householdId: string
}

export class EnsureDefaultShoppingListCommandHandler {
  constructor(private repository: ShoppingListRepository) {}

  async execute(
    command: EnsureDefaultShoppingListCommand,
  ): Promise<ShoppingListWithItemsView | null> {
    const { householdId } = command

    const count = await this.repository.countByHouseholdId(householdId)

    if (count > 0) {
      return null
    }

    const listResult = ShoppingList.create(
      generateShoppingListId(),
      parseHouseholdId(householdId),
      DEFAULT_SHOPPING_LIST_NAME,
    )

    if (!listResult.ok) {
      throw new Error(
        `Failed to create default shopping list: ${listResult.error.type}`,
      )
    }

    const list = listResult.value

    await this.repository.save(list)

    return {
      id: list.id,
      householdId: list.householdId,
      name: list.name,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt?.toISOString() ?? null,
      items: [],
    }
  }
}

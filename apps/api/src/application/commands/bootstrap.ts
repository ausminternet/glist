import type { BootstrapView } from '@glist/views'
import type { CategoryQueryRepository } from '@/domain/category/category-query-repository'
import type { InventoryItemQueryRepository } from '@/domain/inventory-item/inventory-item-query-repository'
import type { ShopQueryRepository } from '@/domain/shop/shop-query-repository'
import type { ShoppingListQueryRepository } from '@/domain/shopping-list/shopping-list-query-repository'
import type { ShoppingListItemQueryRepository } from '@/domain/shopping-list-item/shopping-list-item-query-repository'

export type BootstrapQuery = {
  householdId: string
}

export class BootstrapQueryHandler {
  constructor(
    private readonly shopQueryRepository: ShopQueryRepository,
    private readonly categoryQueryRepository: CategoryQueryRepository,
    private readonly inventoryItemQueryRepository: InventoryItemQueryRepository,
    private readonly shoppingListQueryRepository: ShoppingListQueryRepository,
    private readonly shoppingListItemQueryRepository: ShoppingListItemQueryRepository,
  ) {}

  async execute(query: BootstrapQuery): Promise<BootstrapView> {
    const { householdId } = query

    const [shops, categories, inventoryItems, shoppingLists] =
      await Promise.all([
        this.shopQueryRepository.findAllByHouseholdId(householdId),
        this.categoryQueryRepository.findAllByHouseholdId(householdId),
        this.inventoryItemQueryRepository.findAllByHouseholdId(householdId),
        this.shoppingListQueryRepository.findAllByHouseholdId(householdId),
      ])

    const shoppingListItems =
      await this.shoppingListItemQueryRepository.findAllByShoppingListIds(
        shoppingLists.map((list) => list.id),
      )

    const shoppingListsWithItems = shoppingLists.map((list) => ({
      ...list,
      items: shoppingListItems.filter(
        (item) => item.shoppingListId === list.id,
      ),
    }))

    return {
      shops,
      categories,
      inventoryItems,
      shoppingLists: shoppingListsWithItems,
    }
  }
}

import type { BootstrapView } from '@glist/views'
import type { CategoryQueryRepository } from '@/domain/category/category-query-repository'
import type { InventoryItemQueryRepository } from '@/domain/inventory-item/inventory-item-query-repository'
import type { ShopQueryRepository } from '@/domain/shop/shop-query-repository'
import type { ShoppingListItemQueryRepository } from '@/domain/shopping-list-item/shopping-list-item-query-repository'

export type BootstrapQuery = {
  householdId: string
}

export class BootstrapQueryHandler {
  constructor(
    private readonly shopQueryRepository: ShopQueryRepository,
    private readonly categoryQueryRepository: CategoryQueryRepository,
    private readonly inventoryItemQueryRepository: InventoryItemQueryRepository,
    private readonly shoppingListItemQueryRepository: ShoppingListItemQueryRepository,
  ) {}

  async execute(query: BootstrapQuery): Promise<BootstrapView> {
    const { householdId } = query

    const [shops, categories, inventoryItems, shoppingListItems] =
      await Promise.all([
        this.shopQueryRepository.getAll(householdId),
        this.categoryQueryRepository.getAll(householdId),
        this.inventoryItemQueryRepository.getAll(householdId),
        this.shoppingListItemQueryRepository.getAll(householdId),
      ])

    return {
      shops,
      categories,
      inventoryItems,
      shoppingListItems,
    }
  }
}

import { err, ok, type Result } from '@glist/shared'
import { parseCategoryId } from '@/domain/category/category-id'
import type { InventoryItemNotFoundError } from '@/domain/inventory-item/errors'
import type { EditInventoryItemError as EditInventoryItemAggregateError } from '@/domain/inventory-item/inventory-item'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { parseShopIds } from '@/domain/shop/shop-id'
import type { RequestContext } from '../shared/request-context'

export type EditInventoryItemCommand = {
  itemId: string
  name: string
  description: string | null
  categoryId: string | null
  targetStock: number | null
  targetStockUnit: string | null
  basePriceCents: number | null
  basePriceUnit: string | null
  shopIds: string[]
}

export type EditShoppingListItemError =
  | InventoryItemNotFoundError
  | EditInventoryItemAggregateError

export class EditInventoryItemCommandHandler {
  constructor(private inventortItemRepository: InventoryItemRepository) {}

  async execute(
    command: EditInventoryItemCommand,
    context: RequestContext,
  ): Promise<Result<undefined, EditShoppingListItemError>> {
    const item = await this.inventortItemRepository.findById(command.itemId)

    if (!item || item.householdId !== context.householdId) {
      return err({ type: 'INVENTORY_ITEM_NOT_FOUND', id: command.itemId })
    }

    const result = item.edit({
      name: command.name,
      description: command.description,
      categoryId: command.categoryId
        ? parseCategoryId(command.categoryId)
        : null,
      targetStock: command.targetStock,
      targetStockUnit: command.targetStockUnit,
      basePriceCents: command.basePriceCents,
      basePriceUnit: command.basePriceUnit,
      shopIds: command.shopIds ? parseShopIds(command.shopIds) : [],
    })

    if (!result.ok) {
      return err(result.error)
    }

    await this.inventortItemRepository.save(item)

    return ok(undefined)
  }
}

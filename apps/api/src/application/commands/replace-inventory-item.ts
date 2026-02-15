import { err, ok, type Result } from '@glist/shared'
import { parseCategoryId } from '@/domain/category/category-id'
import type { InventoryItemNotFoundError } from '@/domain/inventory-item/errors'
import type {
  ChangeBasePriceError,
  ChangeNameError,
  ChangeTargetStockError,
} from '@/domain/inventory-item/inventory-item'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { parseShopIds } from '@/domain/shop/shop-id'

export type ReplaceInventoryItemCommand = {
  inventoryItemId: string
  name: string
  description: string | null
  categoryId: string | null
  targetStock: number | null
  targetStockUnit: string | null
  basePriceCents: number | null
  basePriceUnit: string | null
  shopIds: string[]
}

export type ReplaceInventoryItemError =
  | InventoryItemNotFoundError
  | ChangeNameError
  | ChangeTargetStockError
  | ChangeBasePriceError

export class ReplaceInventoryItemCommandHandler {
  constructor(private repository: InventoryItemRepository) {}

  async execute(
    command: ReplaceInventoryItemCommand,
  ): Promise<Result<void, ReplaceInventoryItemError>> {
    const item = await this.repository.findById(command.inventoryItemId)

    if (!item) {
      return err({
        type: 'INVENTORY_ITEM_NOT_FOUND',
        id: command.inventoryItemId,
      })
    }

    const nameResult = item.changeName(command.name)
    if (!nameResult.ok) {
      return err(nameResult.error)
    }

    item.changeDescription(command.description)

    item.changeCategory(
      command.categoryId ? parseCategoryId(command.categoryId) : null,
    )

    const targetStockResult = item.changeTargetStock(
      command.targetStock,
      command.targetStockUnit,
    )
    if (!targetStockResult.ok) {
      return err(targetStockResult.error)
    }

    const basePriceResult = item.changeBasePrice(
      command.basePriceCents,
      command.basePriceUnit,
    )
    if (!basePriceResult.ok) {
      return err(basePriceResult.error)
    }

    item.changeShops(parseShopIds(command.shopIds))

    await this.repository.save(item)

    return ok(undefined)
  }
}

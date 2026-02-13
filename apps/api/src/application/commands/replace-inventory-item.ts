import { parseCategoryId } from '@/domain/category/category-id'
import { InventoryItemNotFoundError } from '@/domain/inventory-item/errors'
import {
  ChangeBasePriceError,
  ChangeNameError,
  ChangeTargetStockError,
} from '@/domain/inventory-item/inventory-item'
import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { parseShopIds } from '@/domain/shared/shop-id'
import { err, ok, Result, unitTypes } from '@glist/shared'
import z from 'zod'
import { RequestContext } from '../shared/request-context'

export const ReplaceInventoryItemCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim().nullable(),
  categoryId: z.uuid().nullable(),
  targetStock: z.number().positive().nullable(),
  targetStockUnit: z.enum(unitTypes).nullable(),
  basePriceCents: z.number().int().positive().nullable(),
  basePriceUnit: z.enum(unitTypes).nullable(),
  shopIds: z.array(z.uuid()),
})

export type ReplaceInventoryItemCommand = z.infer<
  typeof ReplaceInventoryItemCommandSchema
>

export type ReplaceInventoryItemError =
  | InventoryItemNotFoundError
  | ChangeNameError
  | ChangeTargetStockError
  | ChangeBasePriceError

export class ReplaceInventoryItemCommandHandler {
  constructor(private repository: InventoryItemRepository) {}

  async execute(
    inventoryItemId: string,
    command: ReplaceInventoryItemCommand,
    context: RequestContext,
  ): Promise<Result<void, ReplaceInventoryItemError>> {
    const { householdId } = context

    const item = await this.repository.findById(inventoryItemId)

    if (!item || item.householdId !== householdId) {
      return err({ type: 'INVENTORY_ITEM_NOT_FOUND', id: inventoryItemId })
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

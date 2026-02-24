import { err, ok, type Result } from '@glist/shared'
import { parseCategoryId } from '@/domain/category/category-id'
import { parseHouseholdId } from '@/domain/household/household-id'
import {
  type CreateInventoryItemError,
  InventoryItem,
} from '@/domain/inventory-item/inventory-item'
import { generateInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { parseShopIds } from '@/domain/shop/shop-id'
import type { RequestContext } from '../shared/request-context'

export type AddInventoryItemCommand = {
  name: string
  description: string | null
  categoryId: string | null
  targetStock: number | null
  targetStockUnit: string | null
  basePriceCents: number | null
  basePriceUnit: string | null
  shopIds: string[]
}

export class AddInventoryItemCommandHandler {
  constructor(private repository: InventoryItemRepository) {}

  async execute(
    command: AddInventoryItemCommand,
    context: RequestContext,
  ): Promise<Result<string, CreateInventoryItemError>> {
    const householdId = parseHouseholdId(context.householdId)

    const result = InventoryItem.create(
      generateInventoryItemId(),
      householdId,
      {
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
      },
    )

    if (!result.ok) {
      return err(result.error)
    }

    await this.repository.save(result.value)

    return ok(result.value.id)
  }
}

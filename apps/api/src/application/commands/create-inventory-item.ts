import { parseCategoryId } from '@/domain/category/category-id'
import {
  CreateInventoryItemError,
  InventoryItem,
} from '@/domain/inventory-item/inventory-item'
import { generateInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { parseHouseholdId } from '@/domain/shared/household-id'
import { parseShopIds } from '@/domain/shop/shop-id'
import { err, ok, Result } from '@glist/shared'
import { RequestContext } from '../shared/request-context'

export type CreateInventoryItemCommand = {
  name: string
  description?: string
  categoryId?: string
  targetStock?: number
  targetStockUnit?: string
  basePriceCents?: number
  basePriceUnit?: string
  shopIds?: string[]
}

export class CreateInventoryItemCommandHandler {
  constructor(private repository: InventoryItemRepository) {}

  async execute(
    command: CreateInventoryItemCommand,
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
          : undefined,
        targetStock: command.targetStock,
        targetStockUnit: command.targetStockUnit,
        basePriceCents: command.basePriceCents,
        basePriceUnit: command.basePriceUnit,
        shopIds: command.shopIds ? parseShopIds(command.shopIds) : undefined,
      },
    )

    if (!result.ok) {
      return err(result.error)
    }

    await this.repository.save(result.value)

    return ok(result.value.id)
  }
}

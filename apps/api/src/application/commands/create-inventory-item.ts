import { parseCategoryId } from '@/domain/category/category-id'
import {
  CreateInventoryItemError,
  InventoryItem,
} from '@/domain/inventory-item/inventory-item'
import { generateInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { parseHouseholdId } from '@/domain/shared/household-id'
import { parseShopIds } from '@/domain/shared/shop-id'
import { err, ok, Result, unitTypes } from '@glist/shared'
import z from 'zod'
import { RequestContext } from '../shared/request-context'

export const CreateInventoryItemCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim().optional(),
  categoryId: z.uuid().optional(),
  targetStock: z.number().positive().optional(),
  targetStockUnit: z.enum(unitTypes).optional(),
  basePriceCents: z.number().int().positive().optional(),
  basePriceUnit: z.enum(unitTypes).optional(),
  shopIds: z.array(z.uuid()).optional(),
})

export type CreateInventoryItemCommand = z.infer<
  typeof CreateInventoryItemCommandSchema
>

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

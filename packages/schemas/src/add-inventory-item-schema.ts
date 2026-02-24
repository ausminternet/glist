import { z } from 'zod'
import { inventoryItemBaseFields } from './inventory-item-base-fields'

export const addInventoryItemSchema = z.object({
  name: inventoryItemBaseFields.name,
  description: inventoryItemBaseFields.description.nullable(),
  categoryId: inventoryItemBaseFields.categoryId.nullable(),
  targetStock: inventoryItemBaseFields.targetStock.nullable(),
  targetStockUnit: inventoryItemBaseFields.targetStockUnit.nullable(),
  basePriceCents: inventoryItemBaseFields.basePriceCents.nullable(),
  basePriceUnit: inventoryItemBaseFields.basePriceUnit.nullable(),
  shopIds: inventoryItemBaseFields.shopIds,
})

export type AddInventoryItemInput = z.infer<typeof addInventoryItemSchema>

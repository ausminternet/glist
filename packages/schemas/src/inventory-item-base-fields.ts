import { UNIT_TYPES } from '@glist/shared'
import { z } from 'zod'

export const inventoryItemBaseFields = {
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim(),
  categoryId: z.uuid(),
  targetStock: z.number().positive(),
  targetStockUnit: z.enum(UNIT_TYPES),
  basePriceCents: z.int().positive(),
  basePriceUnit: z.enum(UNIT_TYPES),
  shopIds: z.array(z.uuid()),
}

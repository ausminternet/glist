import { UNIT_TYPES } from '@glist/shared'
import { z } from 'zod'

export const shoppingListItemBaseFields = {
  name: z.string().trim().min(1, 'Name cannot be empty'),
  description: z.string().trim(),
  categoryId: z.uuid(),
  quantity: z.number().positive(),
  quantityUnit: z.enum(UNIT_TYPES),
  shopIds: z.array(z.uuid()),
  inventoryItemId: z.uuid(),
}

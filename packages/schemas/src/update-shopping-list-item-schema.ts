import { z } from 'zod'

import { shoppingListItemBaseFields } from './shopping-list-item-fields'

export const updateShoppingListItemSchema = z.object({
  name: shoppingListItemBaseFields.name.optional(),
  description: shoppingListItemBaseFields.description.nullable().optional(),
  categoryId: shoppingListItemBaseFields.categoryId.nullable().optional(),
  quantity: shoppingListItemBaseFields.quantity.nullable().optional(),
  quantityUnit: shoppingListItemBaseFields.quantityUnit.nullable().optional(),
  shopIds: shoppingListItemBaseFields.shopIds,
  inventoryItemId: shoppingListItemBaseFields.inventoryItemId
    .nullable()
    .optional(),
})

export type UpdateShoppingListItemInput = z.infer<
  typeof updateShoppingListItemSchema
>

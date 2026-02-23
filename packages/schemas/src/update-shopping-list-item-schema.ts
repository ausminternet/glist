import { z } from 'zod'

import { shoppingListItemBaseFields } from './shopping-list-item-fields'

export const updateShoppingListItemSchema = z.object({
  name: shoppingListItemBaseFields.name,
  description: shoppingListItemBaseFields.description.nullable(),
  categoryId: shoppingListItemBaseFields.categoryId.nullable(),
  quantity: shoppingListItemBaseFields.quantity.nullable(),
  quantityUnit: shoppingListItemBaseFields.quantityUnit.nullable(),
  shopIds: shoppingListItemBaseFields.shopIds,
  inventoryItemId: shoppingListItemBaseFields.inventoryItemId.nullable(),
})

export type UpdateShoppingListItemInput = z.infer<
  typeof updateShoppingListItemSchema
>

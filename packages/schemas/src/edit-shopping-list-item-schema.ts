import { z } from 'zod'

import { shoppingListItemBaseFields } from './shopping-list-item-fields'

export const editShoppingListItemSchema = z.object({
  name: shoppingListItemBaseFields.name,
  description: shoppingListItemBaseFields.description.nullable(),
  categoryId: shoppingListItemBaseFields.categoryId.nullable(),
  quantity: shoppingListItemBaseFields.quantity.nullable(),
  quantityUnit: shoppingListItemBaseFields.quantityUnit.nullable(),
  shopIds: shoppingListItemBaseFields.shopIds,
  inventoryItemId: shoppingListItemBaseFields.inventoryItemId.nullable(),
})

export type EditShoppingListItemInput = z.infer<
  typeof editShoppingListItemSchema
>

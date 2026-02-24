import { z } from 'zod'
import { shoppingListItemBaseFields } from './shopping-list-item-base-fields'

export const addShoppingListItemSchema = z.object({
  name: shoppingListItemBaseFields.name,
  description: shoppingListItemBaseFields.description.nullable(),
  categoryId: shoppingListItemBaseFields.categoryId.nullable(),
  quantity: shoppingListItemBaseFields.quantity.nullable(),
  quantityUnit: shoppingListItemBaseFields.quantityUnit.nullable(),
  shopIds: shoppingListItemBaseFields.shopIds,
  inventoryItemId: z.uuid().nullable(),
})

export type AddShoppingListItemInput = z.infer<typeof addShoppingListItemSchema>

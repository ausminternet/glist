import { UnitType } from '@/domain/shared/unit-type'
import { ShoppingList } from '@/domain/shopping-list/shopping-list'

export type ShoppingListItemDto = {
  id: string
  name: string
  description: string | null
  categoryId: string | null
  quantity: number | null
  quantityUnit: UnitType | null
  checked: boolean
  shopIds: string[]
  inventoryItemId: string | null
}

export type ShoppingListDto = {
  id: string
  householdId: string
  name: string
  items: ShoppingListItemDto[]
  createdAt: string
  updatedAt: string | null
}

export function toShoppingListDto(shoppingList: ShoppingList): ShoppingListDto {
  return {
    id: shoppingList.id,
    householdId: shoppingList.householdId,
    name: shoppingList.name,
    items: shoppingList.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      categoryId: item.categoryId,
      quantity: item.quantity,
      quantityUnit: item.quantityUnit,
      checked: item.checked,
      shopIds: [...item.shopIds],
      inventoryItemId: item.inventoryItemId,
    })),
    createdAt: shoppingList.createdAt.toISOString(),
    updatedAt: shoppingList.updatedAt?.toISOString() ?? null,
  }
}

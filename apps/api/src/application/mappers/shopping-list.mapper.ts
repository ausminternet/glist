import { ShoppingList } from '@/domain/shopping-list/shopping-list'
import { ShoppingListDto } from '@glist/dtos'

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

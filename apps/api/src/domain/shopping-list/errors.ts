export type ShoppingListNotFoundError = {
  type: 'SHOPPING_LIST_NOT_FOUND'
  id: string
}

export type ShoppingListItemNotFoundError = {
  type: 'SHOPPING_LIST_ITEM_NOT_FOUND'
  id: string
}

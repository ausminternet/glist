export type ShoppingListNotFoundError = {
  type: 'SHOPPING_LIST_NOT_FOUND'
  id: string
}

export type CannotDeleteLastShoppingListError = {
  type: 'CANNOT_DELETE_LAST_SHOPPING_LIST'
}

export type InvalidNameError = { type: 'INVALID_NAME'; reason: string }
export type InvalidQuantityError = { type: 'INVALID_QUANTITY' }
export type UnitWithoutValueError = { type: 'UNIT_WITHOUT_VALUE' }
export type InvalidUnitError = { type: 'INVALID_UNIT'; unit: string }
export type ShoppingListNotFoundError = {
  type: 'SHOPPING_LIST_NOT_FOUND'
  id: string
}
export type ShoppingListItemNotFoundError = {
  type: 'SHOPPING_LIST_ITEM_NOT_FOUND'
  id: string
}

export type ShoppingListError =
  | InvalidNameError
  | InvalidQuantityError
  | UnitWithoutValueError
  | InvalidUnitError
  | ShoppingListNotFoundError
  | ShoppingListItemNotFoundError

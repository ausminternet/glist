// export class ShoppingListError extends Error {
//   constructor(message: string) {
//     super(message)
//     this.name = 'ShoppingListError'
//   }
// }

// export class InvalidNameError extends ShoppingListError {
//   constructor() {
//     super('name should not be empty')
//   }
// }

// export class ShoppingListItemNotFoundError extends ShoppingListError {
//   constructor(public readonly itemId: string) {
//     super(`item with id ${itemId} not found`)
//   }
// }

// export class ShoppingListNotFoundError extends ShoppingListError {
//   constructor(public readonly id: string) {
//     super(`Shopping list not found: ${id}`)
//   }
// }

export type ShoppingListError =
  | { type: 'SHOPPING_LIST_ITEM_NOT_FOUND'; id: string }
  | { type: 'SHOPPING_LIST_NOT_FOUND'; id: string }
  | { type: 'INVALID_NAME' }
  | { type: 'INVALID_QUANTITY' }
  | { type: 'UNIT_WITHOUT_VALUE' }
  | { type: 'INVALID_UNIT'; unit: string }

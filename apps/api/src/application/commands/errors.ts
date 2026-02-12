export class ShoppingListNotFoundError extends Error {
  constructor(id: string) {
    super(`Shopping list not found: ${id}`)
    this.name = 'ShoppingListNotFoundError'
  }
}

export class ShoppingListItemNotFoundError extends Error {
  constructor(itemId: string) {
    super(`Shopping list item not found: ${itemId}`)
    this.name = 'ShoppingListItemNotFoundError'
  }
}

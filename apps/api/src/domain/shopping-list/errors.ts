export class ShoppingListError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ShoppingListError'
  }
}

export class InvalidNameError extends ShoppingListError {
  constructor() {
    super('name should not be empty')
  }
}

export class ItemNotFoundError extends ShoppingListError {
  constructor(public readonly itemId: string) {
    super(`item with id ${itemId} not found`)
  }
}

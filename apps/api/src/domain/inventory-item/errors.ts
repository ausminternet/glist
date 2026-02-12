export class InventoryItemError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InventoryItemError'
  }
}

export class InvalidNameError extends InventoryItemError {
  constructor() {
    super('name should not be empty')
  }
}

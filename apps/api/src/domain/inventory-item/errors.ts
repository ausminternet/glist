export type InventoryItemError =
  | { type: 'INVENTORY_ITEM_NOT_FOUND'; id: string }
  | { type: 'INVALID_NAME' }
  | { type: 'INVALID_QUANTITY' }
  | { type: 'UNIT_WITHOUT_VALUE' }
  | { type: 'INVALID_UNIT'; unit: string }
  | { type: 'INVALID_PRICE' }
  | { type: 'PRICE_UNIT_WITHOUT_VALUE' }

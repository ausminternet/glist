export type ItemCheckedEvent = {
  type: 'item-checked'
  listId: string
  itemId: string
}
export type ItemUncheckedEvent = {
  type: 'item-unchecked'
  listId: string
  itemId: string
}
export type ItemAddedEvent = {
  type: 'item-added'
  listId: string
  itemId: string
}
export type ItemRemovedEvent = {
  type: 'item-removed'
  listId: string
  itemId: string
}
export type ItemUpdatedEvent = {
  type: 'item-updated'
  listId: string
  itemId: string
}

export type ShoppingListDomainEvent =
  | ItemCheckedEvent
  | ItemUncheckedEvent
  | ItemAddedEvent
  | ItemRemovedEvent
  | ItemUpdatedEvent

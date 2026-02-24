export type ItemCheckedEvent = {
  type: 'item-checked'
  householdId: string
  itemId: string
}
export type ItemUncheckedEvent = {
  type: 'item-unchecked'
  householdId: string
  itemId: string
}
export type ItemAddedEvent = {
  type: 'item-added'
  householdId: string
  itemId: string
}
export type ItemRemovedEvent = {
  type: 'item-removed'
  householdId: string
  itemId: string
}
export type ItemEditedEvent = {
  type: 'item-edited'
  householdId: string
  itemId: string
}

export type ShoppingListDomainEvent =
  | ItemCheckedEvent
  | ItemUncheckedEvent
  | ItemAddedEvent
  | ItemRemovedEvent
  | ItemEditedEvent

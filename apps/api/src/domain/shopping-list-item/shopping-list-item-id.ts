import { assertValidUuid, type DomainId, generateId } from '../shared/domain-id'

export type ShoppingListItemId = DomainId<'ShoppingListItemId'>

export const parseShoppingListItemId = (raw: string): ShoppingListItemId => {
  assertValidUuid(raw)
  return raw as ShoppingListItemId
}

export const generateShoppingListItemId = (): ShoppingListItemId =>
  generateId<'ShoppingListItemId'>()

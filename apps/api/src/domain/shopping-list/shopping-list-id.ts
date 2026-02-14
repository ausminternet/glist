import { assertValidUuid, type DomainId, generateId } from '../shared/domain-id'

export type ShoppingListId = DomainId<'ShoppingListId'>

export const parseShoppingListId = (raw: string): ShoppingListId => {
  assertValidUuid(raw)
  return raw as ShoppingListId
}

export const generateShoppingListId = (): ShoppingListId =>
  generateId<'ShoppingListId'>()

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type DomainId<Brand extends string> = string & {
  readonly __brand: Brand
}

export type ShoppingListItemId = DomainId<'ShoppingListItemId'>

export const parseShoppingListItemId = (raw: string): ShoppingListItemId => {
  if (!UUID_REGEX.test(raw)) {
    throw new Error('invalid ShoppingListItemId')
  }
  return raw as ShoppingListItemId
}

export const generateShoppingListItemId = (): ShoppingListItemId =>
  crypto.randomUUID() as ShoppingListItemId

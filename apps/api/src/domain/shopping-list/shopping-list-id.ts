const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type DomainId<Brand extends string> = string & {
  readonly __brand: Brand
}

export type ShoppingListId = DomainId<'ShoppingListId'>

export const parseShoppingListId = (raw: string): ShoppingListId => {
  if (!UUID_REGEX.test(raw)) {
    throw new Error('invalid ShoppingListId')
  }
  return raw as ShoppingListId
}

export const generateShoppingListId = (): ShoppingListId =>
  crypto.randomUUID() as ShoppingListId

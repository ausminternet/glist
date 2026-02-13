const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type DomainId<Brand extends string> = string & {
  readonly __brand: Brand
}

export type InventoryItemId = DomainId<'InventoryItemId'>

export const parseInventoryItemId = (raw: string): InventoryItemId => {
  if (!UUID_REGEX.test(raw)) {
    throw new Error('invalid InventoryItemId')
  }
  return raw as InventoryItemId
}

export const generateInventoryItemId = (): InventoryItemId =>
  crypto.randomUUID() as InventoryItemId

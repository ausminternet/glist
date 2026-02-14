import { assertValidUuid, type DomainId, generateId } from '../shared/domain-id'

export type InventoryItemId = DomainId<'InventoryItemId'>

export const parseInventoryItemId = (raw: string): InventoryItemId => {
  assertValidUuid(raw)
  return raw as InventoryItemId
}

export const generateInventoryItemId = (): InventoryItemId =>
  generateId<'InventoryItemId'>()

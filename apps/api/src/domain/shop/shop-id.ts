import { assertValidUuid, type DomainId, generateId } from '../shared/domain-id'

export type ShopId = DomainId<'ShopId'>

export const parseShopId = (raw: string): ShopId => {
  assertValidUuid(raw)
  return raw as ShopId
}

export const parseShopIds = (raws: string[]): ShopId[] => {
  return raws.map(parseShopId)
}

export const generateShopId = (): ShopId => generateId<'ShopId'>()

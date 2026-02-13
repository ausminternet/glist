const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type ShopId = string & { readonly __brand: 'ShopId' }

export const parseShopId = (raw: string): ShopId => {
  if (!UUID_REGEX.test(raw)) {
    throw new Error('invalid ShopId')
  }
  return raw as ShopId
}

export const parseShopIds = (raws: string[]): ShopId[] => {
  return raws.map(parseShopId)
}

export const generateShopId = (): ShopId => crypto.randomUUID() as ShopId

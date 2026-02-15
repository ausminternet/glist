import type { ShopView } from '@glist/views'

export const getShopFromId = (shopId: string, shops: ShopView[]) => {
  return shops.find((shop) => shop.id === shopId)?.name
}

export const getShopsFromIds = (shopIds: string[], shops: ShopView[]) => {
  return shopIds.map((shopId) => getShopFromId(shopId, shops))
}

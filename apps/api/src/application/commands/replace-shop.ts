import { err, ok, type Result } from '@glist/shared'
import type { ShopNotFoundError } from '@/domain/shop/errors'
import type { ChangeNameError } from '@/domain/shop/shop'
import type { ShopRepository } from '@/domain/shop/shop-repository'
import type { RequestContext } from '../shared/request-context'

export type ReplaceShopCommand = {
  name: string
  shopId: string
}

export type ReplaceShopError = ShopNotFoundError | ChangeNameError

export class ReplaceShopCommandHandler {
  constructor(private repository: ShopRepository) {}

  async execute(
    command: ReplaceShopCommand,
    context: RequestContext,
  ): Promise<Result<void, ReplaceShopError>> {
    const shop = await this.repository.findById(command.shopId)

    if (!shop || shop.householdId !== context.householdId) {
      return err({ type: 'SHOP_NOT_FOUND', id: command.shopId })
    }

    const nameResult = shop.changeName(command.name)
    if (!nameResult.ok) {
      return err(nameResult.error)
    }

    await this.repository.save(shop)

    return ok(undefined)
  }
}

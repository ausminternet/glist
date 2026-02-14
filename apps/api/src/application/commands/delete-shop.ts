import { err, ok, type Result } from '@glist/shared'
import type { ShopRepository } from '@/domain/shop/shop-repository'
import type { RequestContext } from '../shared/request-context'

export type DeleteShopError = { type: 'SHOP_NOT_FOUND'; id: string }

export type DeleteShopCommand = {
  shopId: string
}

export class DeleteShopCommandHandler {
  constructor(private repository: ShopRepository) {}

  async execute(
    command: DeleteShopCommand,
    context: RequestContext,
  ): Promise<Result<void, DeleteShopError>> {
    const { householdId } = context

    const shop = await this.repository.findById(command.shopId)

    if (!shop || shop.householdId !== householdId) {
      return err({ type: 'SHOP_NOT_FOUND', id: command.shopId })
    }

    await this.repository.delete(command.shopId)

    return ok(undefined)
  }
}

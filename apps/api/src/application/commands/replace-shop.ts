import { ShopNotFoundError } from '@/domain/shop/errors';
import { ChangeNameError } from '@/domain/shop/shop';
import { ShopRepository } from '@/domain/shop/shop-repository';
import { err, ok, Result } from '@glist/shared';
import z from 'zod';
import { RequestContext } from '../shared/request-context';

export const ReplaceShopCommandSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
})

export type ReplaceShopCommand = z.infer<typeof ReplaceShopCommandSchema>

export type ReplaceShopError = ShopNotFoundError | ChangeNameError

export class ReplaceShopCommandHandler {
  constructor(private repository: ShopRepository) {}

  async execute(
    shopId: string,
    command: ReplaceShopCommand,
    context: RequestContext,
  ): Promise<Result<void, ReplaceShopError>> {
    const { householdId } = context

    const shop = await this.repository.findById(shopId)

    if (!shop || shop.householdId !== householdId) {
      return err({ type: 'SHOP_NOT_FOUND', id: shopId })
    }

    const nameResult = shop.changeName(command.name)
    if (!nameResult.ok) {
      return err(nameResult.error)
    }

    await this.repository.save(shop)

    return ok(undefined)
  }
}

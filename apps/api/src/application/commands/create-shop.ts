import { parseHouseholdId } from '@/domain/shared/household-id'
import { CreateShopError, Shop } from '@/domain/shop/shop'
import { generateShopId } from '@/domain/shop/shop-id'
import { ShopRepository } from '@/domain/shop/shop-repository'
import { err, ok, Result } from '@glist/shared'
import { RequestContext } from '../shared/request-context'

export type CreateShopCommand = {
  name: string
}

export class CreateShopCommandHandler {
  constructor(private repository: ShopRepository) {}

  async execute(
    command: CreateShopCommand,
    context: RequestContext,
  ): Promise<Result<string, CreateShopError>> {
    const householdId = parseHouseholdId(context.householdId)

    const result = Shop.create(generateShopId(), householdId, {
      name: command.name,
    })

    if (!result.ok) {
      return err(result.error)
    }

    await this.repository.save(result.value)

    return ok(result.value.id)
  }
}

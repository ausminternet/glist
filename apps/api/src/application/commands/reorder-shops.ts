import { ShopRepository } from '@/domain/shop/shop-repository';
import { err, ok, Result } from '@glist/shared';
import z from 'zod';
import { RequestContext } from '../shared/request-context';

export const ReorderShopsCommandSchema = z.object({
  ids: z.array(z.uuid()).min(1, 'At least one shop id is required'),
})

export type ReorderShopsCommand = z.infer<typeof ReorderShopsCommandSchema>

export type ReorderShopsError =
  | { type: 'SHOP_NOT_FOUND'; id: string }
  | { type: 'SHOP_IDS_MISMATCH'; reason: string }

export class ReorderShopsCommandHandler {
  constructor(private repository: ShopRepository) {}

  async execute(
    command: ReorderShopsCommand,
    context: RequestContext,
  ): Promise<Result<void, ReorderShopsError>> {
    const { householdId } = context

    const shops = await this.repository.findAllByHouseholdId(householdId)

    // Verify all provided IDs belong to this household
    const existingIds = new Set(shops.map((s) => s.id as string))
    for (const id of command.ids) {
      if (!existingIds.has(id)) {
        return err({ type: 'SHOP_NOT_FOUND', id })
      }
    }

    // Verify all shops are included (no partial reorder)
    if (command.ids.length !== shops.length) {
      return err({
        type: 'SHOP_IDS_MISMATCH',
        reason: `Expected ${shops.length} shop ids, got ${command.ids.length}`,
      })
    }

    // Check for duplicates
    const uniqueIds = new Set(command.ids)
    if (uniqueIds.size !== command.ids.length) {
      return err({
        type: 'SHOP_IDS_MISMATCH',
        reason: 'Duplicate shop ids provided',
      })
    }

    // Update sort order for each shop
    const shopMap = new Map(shops.map((s) => [s.id as string, s]))
    const updates = command.ids.map((id, index) => {
      const shop = shopMap.get(id)!
      shop.changeSortOrder(index)
      return this.repository.save(shop)
    })

    await Promise.all(updates)

    return ok(undefined)
  }
}

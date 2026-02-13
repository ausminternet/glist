import { InventoryItemQueryRepository } from '@/domain/inventory-item/inventory-item-query-repository'
import { InventoryItemView } from '@glist/views'
import { RequestContext } from '../shared/request-context'

export class GetInventoryItemsQueryHandler {
  constructor(private repository: InventoryItemQueryRepository) {}

  async execute(context: RequestContext): Promise<InventoryItemView[]> {
    const items = await this.repository.findAllByHouseholdId(
      context.householdId,
    )

    return items
  }
}

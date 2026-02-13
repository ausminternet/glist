import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { InventoryItemDto } from '@glist/dtos'
import { toInventoryItemDto } from '../mappers/inventory-item.mapper'
import { RequestContext } from '../shared/request-context'

export class GetInventoryItemsQueryHandler {
  constructor(private repository: InventoryItemRepository) {}

  async execute(context: RequestContext): Promise<InventoryItemDto[]> {
    const items = await this.repository.findAllByHouseholdId(
      context.householdId,
    )

    return items.map(toInventoryItemDto)
  }
}

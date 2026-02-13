import { InventoryItemDtoRepository } from '@/domain/inventory-item/inventory-item-dto-repository'
import { InventoryItemDto } from '@glist/dtos'
import { RequestContext } from '../shared/request-context'
export class GetInventoryItemsQueryHandler {
  constructor(private repository: InventoryItemDtoRepository) {}

  async execute(context: RequestContext): Promise<InventoryItemDto[]> {
    const items = await this.repository.findAllByHouseholdId(
      context.householdId,
    )

    return items
  }
}

import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import { InventoryItemDto } from '@glist/dtos'
import { toInventoryItemDto } from '../mappers/inventory-item.mapper'

export class GetInventoryItemsQuery {
  constructor(private repository: InventoryItemRepository) {}

  async execute(householdId: string): Promise<InventoryItemDto[]> {
    const items = await this.repository.findAllByHouseholdId(householdId)

    return items.map(toInventoryItemDto)
  }
}

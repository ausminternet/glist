import { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository';
import { InventoryItemDto, toInventoryItemDto } from '../dtos/inventory-item.dto';

export class GetInventoryItemsQuery {
  constructor(private repository: InventoryItemRepository) {}

  async execute(householdId: string): Promise<InventoryItemDto[]> {
    const items = await this.repository.findAllByHouseholdId(householdId)

    return items.map(toInventoryItemDto)
  }
}

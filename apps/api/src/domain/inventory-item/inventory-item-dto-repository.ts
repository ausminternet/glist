import { InventoryItemDto } from '@glist/dtos'

export interface InventoryItemDtoRepository {
  findAllByHouseholdId(householdId: string): Promise<InventoryItemDto[]>
}

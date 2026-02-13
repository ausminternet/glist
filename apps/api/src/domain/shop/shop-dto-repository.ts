import { ShopDto } from '@glist/dtos';

export interface ShopDtoRepository {
  findAllByHouseholdId(householdId: string): Promise<ShopDto[]>
}

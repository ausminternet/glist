import { Shop } from './shop';

export interface ShopRepository {
  findById(id: string): Promise<Shop | null>
  findAllByHouseholdId(householdId: string): Promise<Shop[]>
  save(shop: Shop): Promise<void>
  delete(id: string): Promise<void>
}

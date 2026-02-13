import { ShoppingListDto } from '@glist/dtos'

export interface ShoppingListDtoRepository {
  findById(id: string): Promise<ShoppingListDto | null>
}

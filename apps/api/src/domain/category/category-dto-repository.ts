import { CategoryDto } from '@glist/dtos'

export interface CategoryDtoRepository {
  findAllByHouseholdId(householdId: string): Promise<CategoryDto[]>
}

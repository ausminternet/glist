import type { Category } from './category'

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>
  findAllByHouseholdId(householdId: string): Promise<Category[]>
  save(category: Category): Promise<void>
  saveMany(categories: Category[]): Promise<void>
  delete(id: string): Promise<void>
}

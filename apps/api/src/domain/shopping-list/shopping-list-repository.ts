import type { ShoppingList } from './shopping-list'

export interface ShoppingListRepository {
  save(shoppingList: ShoppingList): Promise<void>
  findById(id: string): Promise<ShoppingList | null>
  delete(id: string): Promise<void>
  countByHouseholdId(householdId: string): Promise<number>
}

import { ShoppingList } from './shopping-list';

export interface ShoppingListRepository {
  save(shoppingList: ShoppingList): Promise<void>
  findById(id: string): Promise<ShoppingList | null>
}

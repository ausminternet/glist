import { create } from 'zustand'

export const useShoppingListSelectionStore = create<{
  shoppingListId: string | null
  setShoppingListId: (id: string | null) => void
}>((set) => ({
  shoppingListId: null,
  setShoppingListId: (id) => set({ shoppingListId: id }),
}))

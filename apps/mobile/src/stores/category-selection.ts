import { create } from 'zustand'

interface CategorySelectionStoreType {
  selectedCategoryId: string | null
  setSelectedCategoryId: (id: string | null) => void
  clearSelectedCategory: () => void
}

export const useCategorySelectionStore = create<CategorySelectionStoreType>(
  (set) => ({
    selectedCategoryId: null,
    setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
    clearSelectedCategory: () => set({ selectedCategoryId: null }),
  }),
)

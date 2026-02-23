import { create } from 'zustand'

interface ShopsSelectionStoreType {
  selectedShopIds: string[]
  setSelectedShopIds: (ids: string[]) => void
  addShopId: (id: string) => void
  removeShopId: (id: string) => void
  clearSelectedShops: () => void
}

export const useShopsSelectionStore = create<ShopsSelectionStoreType>(
  (set) => ({
    selectedShopIds: [],
    addShopId: (id) =>
      set((state) => ({
        selectedShopIds: state.selectedShopIds
          ? [...state.selectedShopIds, id]
          : [id],
      })),
    removeShopId: (id) =>
      set((state) => ({
        selectedShopIds: state.selectedShopIds
          ? state.selectedShopIds.filter((shopId) => shopId !== id)
          : [],
      })),
    setSelectedShopIds: (ids) => set({ selectedShopIds: ids }),
    clearSelectedShops: () => set({ selectedShopIds: [] }),
  }),
)

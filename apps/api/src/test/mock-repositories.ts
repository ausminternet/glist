import { mock } from 'bun:test'
import type { Category } from '@/domain/category/category'
import type { CategoryRepository } from '@/domain/category/category-repository'
import type { Household } from '@/domain/household/household'
import type { HouseholdRepository } from '@/domain/household/household-repository'
import type { InventoryItem } from '@/domain/inventory-item/inventory-item'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import type { Shop } from '@/domain/shop/shop'
import type { ShopRepository } from '@/domain/shop/shop-repository'
import type { ShoppingListItem } from '@/domain/shopping-list-item/shopping-list-item'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import type { PhotoStorage } from '@/infrastructure/storage/photo-storage'

export type MockShoppingListItemRepositoryWithCapture =
  ShoppingListItemRepository & {
    savedItem: ShoppingListItem | null
  }

export function createMockHouseholdRepository(
  household: Household | null = null,
): HouseholdRepository {
  return {
    find: mock(() => Promise.resolve(household)),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
  }
}

export function createMockCategoryRepository(
  categories: Category[] = [],
): CategoryRepository {
  return {
    findById: mock((id: string) =>
      Promise.resolve(categories.find((c) => c.id === id) ?? null),
    ),
    findAllByHouseholdId: mock(() => Promise.resolve(categories)),
    save: mock(() => Promise.resolve()),
    saveMany: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
  }
}

export function createMockShopRepository(shops: Shop[] = []): ShopRepository {
  return {
    findById: mock((id: string) =>
      Promise.resolve(shops.find((s) => s.id === id) ?? null),
    ),
    findAllByHouseholdId: mock(() => Promise.resolve(shops)),
    save: mock(() => Promise.resolve()),
    saveMany: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
  }
}

export function createMockInventoryItemRepository(
  items: InventoryItem[] = [],
): InventoryItemRepository {
  return {
    findById: mock((id: string) =>
      Promise.resolve(items.find((i) => i.id === id) ?? null),
    ),
    findAllByHouseholdId: mock(() => Promise.resolve(items)),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
  }
}

export function createMockShoppingListItemRepository(
  items: ShoppingListItem[] = [],
): ShoppingListItemRepository {
  return {
    findById: mock((id: string) =>
      Promise.resolve(items.find((i) => i.id === id) ?? null),
    ),
    findCheckedByHouseholdId: mock((householdId: string) =>
      Promise.resolve(
        items.filter((i) => i.householdId === householdId && i.checked),
      ),
    ),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    deleteCheckedByHouseholdId: mock(() => Promise.resolve()),
  }
}

export function createMockShoppingListItemRepositoryWithCapture(): MockShoppingListItemRepositoryWithCapture {
  const repository: MockShoppingListItemRepositoryWithCapture = {
    savedItem: null,
    findById: mock(() => Promise.resolve(null)),
    findCheckedByHouseholdId: mock(() => Promise.resolve([])),
    save: mock((item: ShoppingListItem) => {
      repository.savedItem = item
      return Promise.resolve()
    }),
    delete: mock(() => Promise.resolve()),
    deleteCheckedByHouseholdId: mock(() => Promise.resolve()),
  }
  return repository
}

export function createMockPhotoStorage(): PhotoStorage {
  return {
    upload: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    getPublicUrl: mock((key: string) => `https://example.com/${key}`),
  }
}

import { Category, type CategoryProps } from '@/domain/category/category'
import {
  type CategoryId,
  generateCategoryId,
} from '@/domain/category/category-id'
import { Household, type HouseholdProps } from '@/domain/household/household'
import {
  generateHouseholdId,
  type HouseholdId,
} from '@/domain/household/household-id'
import {
  InventoryItem,
  type InventoryItemProps,
} from '@/domain/inventory-item/inventory-item'
import {
  generateInventoryItemId,
  type InventoryItemId,
} from '@/domain/inventory-item/inventory-item-id'
import { ItemPhoto } from '@/domain/shared/item-photo'
import { Price } from '@/domain/shared/price'
import { Quantity } from '@/domain/shared/quantity'
import { Shop, type ShopProps } from '@/domain/shop/shop'
import { generateShopId, type ShopId } from '@/domain/shop/shop-id'
import {
  ShoppingListItem,
  type ShoppingListItemProps,
} from '@/domain/shopping-list-item/shopping-list-item'
import { generateShoppingListItemId } from '@/domain/shopping-list-item/shopping-list-item-id'

type HouseholdFactoryOptions = {
  id?: HouseholdId
  name?: string
  createdAt?: Date
  updatedAt?: Date | null
}

export function createTestHousehold(
  options: HouseholdFactoryOptions = {},
): Household {
  const props: HouseholdProps = {
    id: options.id ?? generateHouseholdId(),
    name: options.name ?? 'Test Household',
    createdAt: options.createdAt ?? new Date(),
    updatedAt: options.updatedAt ?? null,
  }
  return new Household(props)
}

type CategoryFactoryOptions = {
  householdId?: HouseholdId
  name?: string
  sortOrder?: number
}

export function createTestCategory(
  options: CategoryFactoryOptions = {},
): Category {
  const householdId = options.householdId ?? generateHouseholdId()
  const props: CategoryProps = {
    id: generateCategoryId(),
    householdId,
    name: options.name ?? 'Test Category',
    sortOrder: options.sortOrder ?? 1000,
    createdAt: new Date(),
    updatedAt: null,
  }
  return new Category(props)
}

type ShopFactoryOptions = {
  householdId?: HouseholdId
  name?: string
  sortOrder?: number
}

export function createTestShop(options: ShopFactoryOptions = {}): Shop {
  const householdId = options.householdId ?? generateHouseholdId()
  const props: ShopProps = {
    id: generateShopId(),
    householdId,
    name: options.name ?? 'Test Shop',
    sortOrder: options.sortOrder ?? 1000,
    createdAt: new Date(),
    updatedAt: null,
  }
  return new Shop(props)
}

type InventoryItemFactoryOptions = {
  householdId?: HouseholdId
  name?: string
  description?: string | null
  categoryId?: CategoryId | null
  shopIds?: readonly ShopId[]
  photoKeys?: readonly string[]
}

export function createTestInventoryItem(
  options: InventoryItemFactoryOptions = {},
): InventoryItem {
  const householdId = options.householdId ?? generateHouseholdId()

  const quantityResult = Quantity.create(null, null)
  if (!quantityResult.ok) throw new Error('Failed to create quantity')

  const priceResult = Price.create(null, null)
  if (!priceResult.ok) throw new Error('Failed to create price')

  const props: InventoryItemProps = {
    id: generateInventoryItemId(),
    householdId,
    name: options.name ?? 'Test Inventory Item',
    description: options.description ?? null,
    categoryId: options.categoryId ?? null,
    targetStock: quantityResult.value,
    basePrice: priceResult.value,
    shopIds: options.shopIds ?? [],
    photos: options.photoKeys
      ? options.photoKeys.map((k) => ItemPhoto.create(k))
      : [],
    createdAt: new Date(),
    updatedAt: null,
  }
  return new InventoryItem(props)
}

type ShoppingListItemFactoryOptions = {
  householdId?: HouseholdId
  name?: string
  description?: string | null
  categoryId?: CategoryId | null
  shopIds?: readonly ShopId[]
  checked?: boolean
  photoKeys?: readonly string[]
  inventoryItemId?: InventoryItemId | null
}

export function createTestShoppingListItem(
  options: ShoppingListItemFactoryOptions = {},
): ShoppingListItem {
  const householdId = options.householdId ?? generateHouseholdId()

  const quantityResult = Quantity.create(null, null)
  if (!quantityResult.ok) throw new Error('Failed to create quantity')

  const props: ShoppingListItemProps = {
    id: generateShoppingListItemId(),
    householdId,
    inventoryItemId: options.inventoryItemId ?? null,
    name: options.name ?? 'Test Shopping List Item',
    description: options.description ?? null,
    categoryId: options.categoryId ?? null,
    quantity: quantityResult.value,
    checked: options.checked ?? false,
    shopIds: options.shopIds ?? [],
    photos: options.photoKeys
      ? options.photoKeys.map((k) => ItemPhoto.create(k))
      : [],
    createdAt: new Date(),
    updatedAt: null,
  }
  return new ShoppingListItem(props)
}

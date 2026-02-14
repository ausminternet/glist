import { err, ok, type Result, type UnitType } from '@glist/shared'
import { isBlank } from '@/utils/is-blank'
import type { CategoryId } from '../category/category-id'
import type { InventoryItemId } from '../inventory-item/inventory-item-id'
import type { InvalidNameError } from '../shared/errors'
import { Quantity, type QuantityError } from '../shared/quantity'
import type { ShopId } from '../shop/shop-id'
import type { ShoppingListId } from './shopping-list-id'
import type { ShoppingListItemId } from './shopping-list-item-id'

export type NewShoppingListItemInput = {
  name: string
  description?: string
  categoryId?: CategoryId
  quantity?: number
  quantityUnit?: string
  shopIds?: ShopId[]
}

export type ShoppingListItemProps = {
  id: ShoppingListItemId
  shoppingListId: ShoppingListId
  inventoryItemId: InventoryItemId | null
  name: string
  description: string | null
  categoryId: CategoryId | null
  quantity: Quantity
  checked: boolean
  shopIds: readonly ShopId[]
  photoKey: string | null
  createdAt: Date
  updatedAt: Date | null
}

export type CreateShoppingListItemError = InvalidNameError | QuantityError

export type ChangeNameError = InvalidNameError

export type ChangeQuantityError = QuantityError

export class ShoppingListItem {
  constructor(private props: ShoppingListItemProps) {}

  static create(
    id: ShoppingListItemId,
    shoppingListId: ShoppingListId,
    input: NewShoppingListItemInput,
  ): Result<ShoppingListItem, CreateShoppingListItemError> {
    if (isBlank(input.name)) {
      return err({ type: 'INVALID_NAME', reason: 'Name cannot be empty' })
    }

    const quantityResult = Quantity.create(
      input.quantity ?? null,
      input.quantityUnit ?? null,
    )

    if (!quantityResult.ok) {
      return err(quantityResult.error)
    }

    return ok(
      new ShoppingListItem({
        id,
        shoppingListId,
        name: input.name,
        description: input.description ?? null,
        categoryId: input.categoryId ?? null,
        quantity: quantityResult.value,
        checked: false,
        shopIds: input.shopIds ?? [],
        photoKey: null,
        createdAt: new Date(),
        updatedAt: null,
        inventoryItemId: null,
      }),
    )
  }

  static createFromInventoryItem(
    id: ShoppingListItemId,
    shoppingListId: ShoppingListId,
    inventoryItem: {
      inventoryItemId: InventoryItemId
      name: string
      description: string | null
      categoryId: CategoryId | null
      shopIds: readonly ShopId[]
    },
  ): ShoppingListItem {
    return new ShoppingListItem({
      id,
      inventoryItemId: inventoryItem.inventoryItemId,
      shoppingListId,
      name: inventoryItem.name,
      description: inventoryItem.description,
      categoryId: inventoryItem.categoryId,
      quantity: Quantity.empty(),
      checked: false,
      shopIds: inventoryItem.shopIds,
      photoKey: null,
      createdAt: new Date(),
      updatedAt: null,
    })
  }

  get id(): ShoppingListItemId {
    return this.props.id
  }
  get shoppingListId(): ShoppingListId {
    return this.props.shoppingListId
  }
  get name(): string {
    return this.props.name
  }
  get description(): string | null {
    return this.props.description
  }
  get categoryId(): CategoryId | null {
    return this.props.categoryId
  }
  get quantity(): number | null {
    return this.props.quantity.value
  }
  get quantityUnit(): UnitType | null {
    return this.props.quantity.unit
  }
  get checked(): boolean {
    return this.props.checked
  }
  get shopIds(): readonly ShopId[] {
    return this.props.shopIds
  }
  get photoKey(): string | null {
    return this.props.photoKey
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date | null {
    return this.props.updatedAt
  }

  get inventoryItemId(): InventoryItemId | null {
    return this.props.inventoryItemId
  }

  changeName(name: string): Result<void, ChangeNameError> {
    if (isBlank(name)) {
      return err({ type: 'INVALID_NAME', reason: 'Name cannot be empty' })
    }
    this.props.name = name
    this.props.updatedAt = new Date()

    return ok(undefined)
  }

  changeDescription(description: string | null): void {
    this.props.description = description
    this.props.updatedAt = new Date()
  }

  changeQuantity(
    quantity: number | null,
    quantityUnit: string | null,
  ): Result<void, ChangeQuantityError> {
    const quantityResult = Quantity.create(quantity, quantityUnit)

    if (!quantityResult.ok) {
      return err(quantityResult.error)
    }

    this.props.quantity = quantityResult.value
    this.props.updatedAt = new Date()

    return ok(undefined)
  }

  changeCategory(categoryId: CategoryId | null): void {
    this.props.categoryId = categoryId
    this.props.updatedAt = new Date()
  }

  changeShops(shopIds: ShopId[]): void {
    this.props.shopIds = [...shopIds]
    this.props.updatedAt = new Date()
  }

  toggleChecked(): void {
    this.props.checked = !this.props.checked
    this.props.updatedAt = new Date()
  }

  check(): void {
    this.props.checked = true
    this.props.updatedAt = new Date()
  }

  uncheck(): void {
    this.props.checked = false
    this.props.updatedAt = new Date()
  }

  setPhotoKey(photoKey: string | null): void {
    this.props.photoKey = photoKey
    this.props.updatedAt = new Date()
  }
}

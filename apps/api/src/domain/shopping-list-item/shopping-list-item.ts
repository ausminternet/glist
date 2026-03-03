import { err, ok, type Result, type UnitType } from '@glist/shared'
import { isBlank } from '@/utils/is-blank'
import type { CategoryId } from '../category/category-id'
import type { HouseholdId } from '../household/household-id'
import type { InventoryItemId } from '../inventory-item/inventory-item-id'
import type { InvalidNameError } from '../shared/errors'
import { ItemPhoto } from '../shared/item-photo'
import { Quantity, type QuantityError } from '../shared/quantity'
import type { ShopId } from '../shop/shop-id'
import type { ShoppingListItemId } from './shopping-list-item-id'

export type NewShoppingListItemInput = {
  householdId: HouseholdId
  name: string
  description: string | null
  categoryId: CategoryId | null
  quantity: number | null
  quantityUnit: string | null
  shopIds: ShopId[]
  inventoryItemId: InventoryItemId | null
  photoKeys: string[]
}

type EditShoppingListItemInput = Omit<NewShoppingListItemInput, 'householdId'>

export type ShoppingListItemProps = {
  id: ShoppingListItemId
  householdId: HouseholdId
  inventoryItemId: InventoryItemId | null
  name: string
  description: string | null
  categoryId: CategoryId | null
  quantity: Quantity
  checked: boolean
  shopIds: readonly ShopId[]
  photos: ItemPhoto[]
  createdAt: Date
  updatedAt: Date | null
}

export type CreateShoppingListItemError = InvalidNameError | QuantityError

export type EditShoppingListItemError = InvalidNameError | QuantityError

export class ShoppingListItem {
  constructor(private props: ShoppingListItemProps) {}

  static create(
    id: ShoppingListItemId,
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
        householdId: input.householdId,
        name: input.name,
        description: input.description ?? null,
        categoryId: input.categoryId ?? null,
        quantity: quantityResult.value,
        checked: false,
        shopIds: input.shopIds ?? [],
        photos: input.photoKeys.map((key) => ItemPhoto.create(key)),
        createdAt: new Date(),
        updatedAt: null,
        inventoryItemId: input.inventoryItemId,
      }),
    )
  }

  static createFromInventoryItem(
    id: ShoppingListItemId,
    inventoryItem: {
      inventoryItemId: InventoryItemId
      householdId: HouseholdId
      name: string
      description: string | null
      categoryId: CategoryId | null
      shopIds: readonly ShopId[]
      photoKeys: readonly string[]
    },
  ): ShoppingListItem {
    return new ShoppingListItem({
      id,
      householdId: inventoryItem.householdId,
      inventoryItemId: inventoryItem.inventoryItemId,
      name: inventoryItem.name,
      description: inventoryItem.description,
      categoryId: inventoryItem.categoryId,
      quantity: Quantity.empty(),
      checked: false,
      shopIds: inventoryItem.shopIds,
      photos: inventoryItem.photoKeys.map((key) => ItemPhoto.create(key)),
      createdAt: new Date(),
      updatedAt: null,
    })
  }

  edit(
    input: EditShoppingListItemInput,
  ): Result<void, EditShoppingListItemError> {
    if (isBlank(input.name)) {
      return err({ type: 'INVALID_NAME', reason: 'Name cannot be empty' })
    }

    const quantityResult = Quantity.create(input.quantity, input.quantityUnit)
    if (!quantityResult.ok) {
      return err(quantityResult.error)
    }

    this.props.name = input.name
    this.props.description = input.description
    this.props.categoryId = input.categoryId
    this.props.quantity = quantityResult.value
    this.props.shopIds = [...input.shopIds]
    this.props.updatedAt = new Date()
    this.props.inventoryItemId = input.inventoryItemId
    this.props.photos = input.photoKeys.map((key) => ItemPhoto.create(key))

    return ok(undefined)
  }

  get id(): ShoppingListItemId {
    return this.props.id
  }

  get householdId(): HouseholdId {
    return this.props.householdId
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

  get photos(): readonly ItemPhoto[] {
    return this.props.photos
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

  addPhoto(photoKey: string): void {
    if (!this.props.photos.some((p) => p.photoKey === photoKey)) {
      this.props.photos.push(ItemPhoto.create(photoKey))
      this.props.updatedAt = new Date()
    }
  }

  removePhoto(photoId: string): void {
    this.props.photos = this.props.photos.filter((p) => p.id !== photoId)
    this.props.updatedAt = new Date()
  }
}

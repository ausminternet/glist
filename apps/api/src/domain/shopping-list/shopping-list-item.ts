import { isBlank } from '@/utils/is-blank'
import { err, ok, Result, UnitType } from '@glist/shared'
import { Quantity, QuantityError } from '../shared/quantity'
import { InvalidNameError } from './errors'

export type ShoppingListItemError = InvalidNameError | QuantityError

export type NewShoppingListItemInput = {
  name: string
  description?: string
  categoryId?: string
  quantity?: number
  quantityUnit?: string
  shopIds?: string[]
}

export type ShoppingListItemProps = {
  id: string
  shoppingListId: string
  inventoryItemId: string | null
  name: string
  description: string | null
  categoryId: string | null
  quantity: Quantity
  checked: boolean
  shopIds: readonly string[]
  createdAt: Date
  updatedAt: Date | null
}

export class ShoppingListItem {
  constructor(private props: ShoppingListItemProps) {}

  static create(
    shoppingListId: string,
    input: NewShoppingListItemInput,
  ): Result<ShoppingListItem, InvalidNameError | QuantityError> {
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
        id: crypto.randomUUID(),
        shoppingListId,
        name: input.name,
        description: input.description ?? null,
        categoryId: input.categoryId ?? null,
        quantity: quantityResult.value,
        checked: false,
        shopIds: input.shopIds ?? [],
        createdAt: new Date(),
        updatedAt: null,
        inventoryItemId: null,
      }),
    )
  }

  static createFromInventoryItem(
    shoppingListId: string,
    inventoryItem: {
      inventoryItemId: string
      name: string
      description: string | null
      categoryId: string | null
      shopIds: readonly string[]
    },
  ): ShoppingListItem {
    return new ShoppingListItem({
      id: crypto.randomUUID(),
      inventoryItemId: inventoryItem.inventoryItemId,
      shoppingListId,
      name: inventoryItem.name,
      description: inventoryItem.description,
      categoryId: inventoryItem.categoryId,
      quantity: Quantity.empty(),
      checked: false,
      shopIds: inventoryItem.shopIds,
      createdAt: new Date(),
      updatedAt: null,
    })
  }

  get id(): string {
    return this.props.id
  }
  get shoppingListId(): string {
    return this.props.shoppingListId
  }
  get name(): string {
    return this.props.name
  }
  get description(): string | null {
    return this.props.description
  }
  get categoryId(): string | null {
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
  get shopIds(): readonly string[] {
    return this.props.shopIds
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date | null {
    return this.props.updatedAt
  }

  get inventoryItemId(): string | null {
    return this.props.inventoryItemId
  }

  changeName(name: string): Result<void, InvalidNameError> {
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
  ): Result<void, QuantityError> {
    const quantityResult = Quantity.create(quantity, quantityUnit)

    if (!quantityResult.ok) {
      return err(quantityResult.error)
    }

    this.props.quantity = quantityResult.value
    this.props.updatedAt = new Date()

    return ok(undefined)
  }

  changeCategory(categoryId: string | null): void {
    this.props.categoryId = categoryId
    this.props.updatedAt = new Date()
  }

  changeShops(shopIds: string[]): void {
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
}

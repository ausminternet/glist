import { isBlank } from '@/utils/is-blank'
import { Quantity } from '../shared/quantity'
import { UnitType } from '../shared/unit-type'
import { InvalidNameError } from './errors'

export type NewShoppingListItemInput = {
  name: string
  description?: string
  categoryId?: string
  quantity?: number
  quantityUnit?: string
  shopIds?: string[]
}

type ShoppingListItemProps = {
  id: string
  shoppingListId: string
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
  private constructor(private props: ShoppingListItemProps) {}

  static create(
    shoppingListId: string,
    input: NewShoppingListItemInput,
  ): ShoppingListItem {
    if (isBlank(input.name)) {
      throw new InvalidNameError()
    }

    return new ShoppingListItem({
      id: crypto.randomUUID(),
      shoppingListId,
      name: input.name,
      description: input.description ?? null,
      categoryId: input.categoryId ?? null,
      quantity: Quantity.create(
        input.quantity ?? null,
        input.quantityUnit ?? null,
      ),
      checked: false,
      shopIds: input.shopIds ?? [],
      createdAt: new Date(),
      updatedAt: null,
    })
  }

  static createFromInventoryItem(
    shoppingListId: string,
    inventoryItem: {
      name: string
      description: string | null
      categoryId: string | null
      shopIds: readonly string[]
    },
  ): ShoppingListItem {
    return new ShoppingListItem({
      id: crypto.randomUUID(),
      shoppingListId,
      name: inventoryItem.name,
      description: inventoryItem.description,
      categoryId: inventoryItem.categoryId,
      quantity: Quantity.create(null, null),
      checked: false,
      shopIds: inventoryItem.shopIds,
      createdAt: new Date(),
      updatedAt: null,
    })
  }

  static reconstitute(data: {
    id: string
    shoppingListId: string
    name: string
    description: string | null
    categoryId: string | null
    quantity: number | null
    quantityUnit: string | null
    checked: boolean
    shopIds: string[]
    createdAt: Date
    updatedAt: Date | null
  }): ShoppingListItem {
    return new ShoppingListItem({
      id: data.id,
      shoppingListId: data.shoppingListId,
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      quantity: Quantity.create(data.quantity, data.quantityUnit),
      checked: data.checked,
      shopIds: data.shopIds,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  // --- Getters ---
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

  changeName(name: string): void {
    if (isBlank(name)) {
      throw new InvalidNameError()
    }
    this.props.name = name
    this.props.updatedAt = new Date()
  }

  changeDescription(description: string | null): void {
    this.props.description = description
    this.props.updatedAt = new Date()
  }

  changeQuantity(quantity: number | null, quantityUnit: string | null): void {
    this.props.quantity = Quantity.create(quantity, quantityUnit)
    this.props.updatedAt = new Date()
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

  toSnapshot() {
    return {
      id: this.props.id,
      shoppingListId: this.props.shoppingListId,
      name: this.props.name,
      description: this.props.description,
      categoryId: this.props.categoryId,
      quantity: this.props.quantity.value,
      quantityUnit: this.props.quantity.unit,
      checked: this.props.checked,
      shopIds: [...this.props.shopIds],
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    } as const
  }
}

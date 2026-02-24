import { err, ok, type Result, type UnitType } from '@glist/shared'
import { isBlank } from '@/utils/is-blank'
import type { CategoryId } from '../category/category-id'
import type { HouseholdId } from '../household/household-id'
import type { InvalidNameError } from '../shared/errors'
import { Price, type PriceError } from '../shared/price'
import { Quantity, type QuantityError } from '../shared/quantity'
import type { ShopId } from '../shop/shop-id'
import type { InventoryItemId } from './inventory-item-id'

export type NewInventoryItemInput = {
  name: string
  description: string | null
  categoryId: CategoryId | null
  targetStock: number | null
  targetStockUnit: string | null
  basePriceCents: number | null
  basePriceUnit: string | null
  shopIds: ShopId[]
}

export type EditInventoryItemInput = Omit<NewInventoryItemInput, 'household'>

export type InventoryItemProps = {
  id: InventoryItemId
  householdId: HouseholdId
  name: string
  description: string | null
  categoryId: CategoryId | null
  targetStock: Quantity
  basePrice: Price
  shopIds: readonly ShopId[]
  photoKey: string | null
  createdAt: Date
  updatedAt: Date | null
}

export type CreateInventoryItemError =
  | InvalidNameError
  | QuantityError
  | PriceError

export type EditInventoryItemError =
  | InvalidNameError
  | QuantityError
  | PriceError

export class InventoryItem {
  constructor(private props: InventoryItemProps) {}

  static create(
    id: InventoryItemId,
    householdId: HouseholdId,
    input: NewInventoryItemInput,
  ): Result<InventoryItem, CreateInventoryItemError> {
    if (isBlank(input.name)) {
      return err({ type: 'INVALID_NAME', reason: 'Name cannot be empty' })
    }

    const targetStockResult = Quantity.create(
      input.targetStock ?? null,
      input.targetStockUnit ?? null,
    )

    if (!targetStockResult.ok) {
      return err(targetStockResult.error)
    }

    const basePriceResult = Price.create(
      input.basePriceCents ?? null,
      input.basePriceUnit ?? null,
    )

    if (!basePriceResult.ok) {
      return err(basePriceResult.error)
    }

    return ok(
      new InventoryItem({
        id,
        householdId,
        name: input.name,
        description: input.description ?? null,
        categoryId: input.categoryId ?? null,
        targetStock: targetStockResult.value,
        basePrice: basePriceResult.value,
        shopIds: input.shopIds ?? [],
        photoKey: null,
        createdAt: new Date(),
        updatedAt: null,
      }),
    )
  }

  edit(input: EditInventoryItemInput): Result<void, EditInventoryItemError> {
    if (isBlank(input.name)) {
      return err({ type: 'INVALID_NAME', reason: 'Name cannot be empty' })
    }

    const targetStockResult = Quantity.create(
      input.targetStock ?? null,
      input.targetStockUnit ?? null,
    )

    if (!targetStockResult.ok) {
      return err(targetStockResult.error)
    }

    const basePriceResult = Price.create(
      input.basePriceCents ?? null,
      input.basePriceUnit ?? null,
    )

    if (!basePriceResult.ok) {
      return err(basePriceResult.error)
    }

    this.props.name = input.name
    this.props.description = input.description ?? null
    this.props.categoryId = input.categoryId ?? null
    this.props.targetStock = targetStockResult.value
    this.props.basePrice = basePriceResult.value
    this.props.shopIds = input.shopIds ?? []
    this.props.updatedAt = new Date()

    return ok(undefined)
  }

  get id(): InventoryItemId {
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

  get targetStock(): number | null {
    return this.props.targetStock.value
  }

  get targetStockUnit(): UnitType | null {
    return this.props.targetStock.unit
  }

  get basePriceCents(): number | null {
    return this.props.basePrice.cents
  }

  get basePriceUnit(): UnitType | null {
    return this.props.basePrice.unit
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

  setPhotoKey(photoKey: string | null): void {
    this.props.photoKey = photoKey
    this.props.updatedAt = new Date()
  }
}

import { isBlank } from '@/utils/is-blank'
import { err, ok, Result, UnitType } from '@glist/shared'
import { CategoryId } from '../category/category-id'
import { InvalidNameError } from '../shared/errors'
import { HouseholdId } from '../shared/household-id'
import { Price, PriceError } from '../shared/price'
import { Quantity, QuantityError } from '../shared/quantity'
import { ShopId } from '../shared/shop-id'
import { InventoryItemId } from './inventory-item-id'

export type NewInventoryItemInput = {
  name: string
  description?: string
  categoryId?: CategoryId
  targetStock?: number
  targetStockUnit?: string
  basePriceCents?: number
  basePriceUnit?: string
  shopIds?: ShopId[]
}

export type InventoryItemProps = {
  id: InventoryItemId
  householdId: HouseholdId
  name: string
  description: string | null
  categoryId: CategoryId | null
  targetStock: Quantity
  basePrice: Price
  shopIds: readonly ShopId[]
  createdAt: Date
  updatedAt: Date | null
}

export type CreateInventoryItemError =
  | InvalidNameError
  | QuantityError
  | PriceError

export type ChangeNameError = InvalidNameError

export type ChangeTargetStockError = QuantityError

export type ChangeBasePriceError = PriceError

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
        createdAt: new Date(),
        updatedAt: null,
      }),
    )
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
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date | null {
    return this.props.updatedAt
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

  changeCategory(categoryId: CategoryId | null): void {
    this.props.categoryId = categoryId
    this.props.updatedAt = new Date()
  }

  changeTargetStock(
    targetStock: number | null,
    targetStockUnit: string | null,
  ): Result<void, ChangeTargetStockError> {
    const targetStockResult = Quantity.create(targetStock, targetStockUnit)

    if (!targetStockResult.ok) {
      return err(targetStockResult.error)
    }

    this.props.targetStock = targetStockResult.value
    this.props.updatedAt = new Date()

    return ok(undefined)
  }

  changeBasePrice(
    basePriceCents: number | null,
    basePriceUnit: string | null,
  ): Result<void, ChangeBasePriceError> {
    const basePriceResult = Price.create(basePriceCents, basePriceUnit)

    if (!basePriceResult.ok) {
      return err(basePriceResult.error)
    }

    this.props.basePrice = basePriceResult.value
    this.props.updatedAt = new Date()

    return ok(undefined)
  }

  changeShops(shopIds: ShopId[]): void {
    this.props.shopIds = [...shopIds]
    this.props.updatedAt = new Date()
  }
}

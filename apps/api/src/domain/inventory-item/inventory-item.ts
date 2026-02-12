import { isBlank } from '@/utils/is-blank'
import { Price } from '../shared/price'
import { Quantity } from '../shared/quantity'

import { UnitType } from '@glist/shared'
import { InvalidNameError } from './errors'

export type NewInventoryItemInput = {
  name: string
  description?: string
  categoryId?: string
  targetStock?: number
  targetStockUnit?: string
  basePriceCents?: number
  basePriceUnit?: string
  shopIds?: string[]
}

type InventoryItemProps = {
  id: string
  householdId: string
  name: string
  description: string | null
  categoryId: string | null
  targetStock: Quantity
  basePrice: Price
  shopIds: readonly string[]
  createdAt: Date
  updatedAt: Date | null
}

export class InventoryItem {
  private constructor(private props: InventoryItemProps) {}

  static create(
    householdId: string,
    input: NewInventoryItemInput,
  ): InventoryItem {
    if (isBlank(input.name)) {
      throw new InvalidNameError()
    }

    return new InventoryItem({
      id: crypto.randomUUID(),
      householdId,
      name: input.name,
      description: input.description ?? null,
      categoryId: input.categoryId ?? null,
      targetStock: Quantity.create(
        input.targetStock ?? null,
        input.targetStockUnit ?? null,
      ),
      basePrice: Price.create(
        input.basePriceCents ?? null,
        input.basePriceUnit ?? null,
      ),
      shopIds: input.shopIds ?? [],
      createdAt: new Date(),
      updatedAt: null,
    })
  }

  static reconstitute(data: {
    id: string
    householdId: string
    name: string
    description: string | null
    categoryId: string | null
    targetStock: number | null
    targetStockUnit: string | null
    basePriceCents: number | null
    basePriceUnit: string | null
    shopIds: string[]
    createdAt: Date
    updatedAt: Date | null
  }): InventoryItem {
    return new InventoryItem({
      id: data.id,
      householdId: data.householdId,
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      targetStock: Quantity.create(data.targetStock, data.targetStockUnit),
      basePrice: Price.create(data.basePriceCents, data.basePriceUnit),
      shopIds: data.shopIds,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  get id(): string {
    return this.props.id
  }
  get householdId(): string {
    return this.props.householdId
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

  changeCategory(categoryId: string | null): void {
    this.props.categoryId = categoryId
    this.props.updatedAt = new Date()
  }

  changeTargetStock(
    targetStock: number | null,
    targetStockUnit: string | null,
  ): void {
    this.props.targetStock = Quantity.create(targetStock, targetStockUnit)
    this.props.updatedAt = new Date()
  }

  changeBasePrice(
    basePriceCents: number | null,
    basePriceUnit: string | null,
  ): void {
    this.props.basePrice = Price.create(basePriceCents, basePriceUnit)
    this.props.updatedAt = new Date()
  }

  changeShops(shopIds: string[]): void {
    this.props.shopIds = [...shopIds]
    this.props.updatedAt = new Date()
  }

  toSnapshot() {
    return {
      id: this.props.id,
      householdId: this.props.householdId,
      name: this.props.name,
      description: this.props.description,
      categoryId: this.props.categoryId,
      targetStock: this.props.targetStock.value,
      targetStockUnit: this.props.targetStock.unit,
      basePriceCents: this.props.basePrice.cents,
      basePriceUnit: this.props.basePrice.unit,
      shopIds: [...this.props.shopIds],
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    } as const
  }
}

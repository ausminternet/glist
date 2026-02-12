import { InventoryItem } from '@/domain/inventory-item/inventory-item';
import { UnitType } from '@/domain/shared/unit-type';

export type InventoryItemDto = {
  id: string
  householdId: string
  name: string
  description: string | null
  categoryId: string | null
  targetStock: number | null
  targetStockUnit: UnitType | null
  basePriceCents: number | null
  basePriceUnit: UnitType | null
  shopIds: string[]
  createdAt: string
  updatedAt: string | null
}

export function toInventoryItemDto(item: InventoryItem): InventoryItemDto {
  return {
    id: item.id,
    householdId: item.householdId,
    name: item.name,
    description: item.description,
    categoryId: item.categoryId,
    targetStock: item.targetStock,
    targetStockUnit: item.targetStockUnit,
    basePriceCents: item.basePriceCents,
    basePriceUnit: item.basePriceUnit,
    shopIds: [...item.shopIds],
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt?.toISOString() ?? null,
  }
}

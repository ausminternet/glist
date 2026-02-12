import { InventoryItem } from '@/domain/inventory-item/inventory-item'
import { InventoryItemDto } from '@glist/dtos'

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

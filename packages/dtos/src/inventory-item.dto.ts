import { UnitType } from '@glist/shared'

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
  photoUrl: string | null
}

import { UnitType } from '@glist/shared'

export type ShoppingListItemDto = {
  id: string
  name: string
  description: string | null
  categoryId: string | null
  quantity: number | null
  quantityUnit: UnitType | null
  checked: boolean
  shopIds: string[]
  inventoryItemId: string | null
}

export type ShoppingListDto = {
  id: string
  householdId: string
  name: string
  items: ShoppingListItemDto[]
  createdAt: string
  updatedAt: string | null
}

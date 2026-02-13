import { UnitType } from '@glist/shared'

export type ShoppingListItemView = {
  id: string
  shoppingListId: string
  name: string
  description: string | null
  categoryId: string | null
  quantity: number | null
  quantityUnit: UnitType | null
  checked: boolean
  shopIds: string[]
  inventoryItemId: string | null
  createdAt: string
  updatedAt: string | null
  photoUrl: string | null
}

export type ShoppingListView = {
  id: string
  householdId: string
  name: string
  items: ShoppingListItemView[]
  createdAt: string
  updatedAt: string | null
}

import {
  type AddShoppingListItemInput,
  type EditShoppingListItemInput,
  shoppingListItemBaseFields,
} from '@glist/schemas'
import type { InventoryItemView, ShoppingListItemView } from '@glist/views'
import { useCallback, useEffect, useMemo, useState } from 'react'
import z from 'zod'
import { useCategorySelectionStore } from '@/stores/category-selection'
import { useShopsSelectionStore } from '@/stores/shops-selection'
import { sameUuids } from '@/utils/same-uuids'

export const shoppingListItemFormSchema = z.object({
  name: shoppingListItemBaseFields.name,
  description: shoppingListItemBaseFields.description.optional(),
  quantity: shoppingListItemBaseFields.quantity.optional(),
  quantityUnit: shoppingListItemBaseFields.quantityUnit.optional(),
  shopIds: shoppingListItemBaseFields.shopIds,
  categoryId: shoppingListItemBaseFields.categoryId.optional(),
  inventoryItemId: shoppingListItemBaseFields.inventoryItemId.optional(),
})

export type ShoppingListItemFormValues = z.infer<
  typeof shoppingListItemFormSchema
>

export function toAddShoppingListItemInput(
  values: ShoppingListItemFormValues,
): AddShoppingListItemInput {
  //TODO: Schema validieren
  return {
    name: values.name,
    description: values.description ?? null,
    quantity: values.quantity ?? null,
    quantityUnit: values.quantityUnit ?? null,
    inventoryItemId: values.inventoryItemId ?? null,
    shopIds: values.shopIds,
    categoryId: values.categoryId ?? null,
  }
}

export function toEditShoppingListItemInput(
  values: ShoppingListItemFormValues,
): EditShoppingListItemInput {
  //TODO: Schema validieren
  return {
    name: values.name,
    description: values.description?.trim() ?? null,
    quantity: values.quantity ?? null,
    quantityUnit: values.quantityUnit ?? null,
    inventoryItemId: values.inventoryItemId ?? null,
    shopIds: values.shopIds,
    categoryId: values.categoryId ?? null,
  }
}

export function toShoppingListItemsFormValues(
  item: ShoppingListItemView,
): ShoppingListItemFormValues {
  return {
    name: item.name,
    description: item.description ?? undefined,
    quantity: item.quantity ?? undefined,
    quantityUnit: item.quantityUnit ?? undefined,
    shopIds: item.shopIds,
    categoryId: item.categoryId ?? undefined,
    inventoryItemId: item.inventoryItemId ?? undefined,
  }
}

function inventoryItemToFormValues(
  item: InventoryItemView,
): ShoppingListItemFormValues {
  return {
    name: item.name,
    description: item.description ?? undefined,
    quantity: item.targetStock ?? undefined,
    quantityUnit: item.targetStockUnit ?? undefined,
    shopIds: item.shopIds,
    categoryId: item.categoryId ?? undefined,
    inventoryItemId: item.id,
  }
}

function shallowEqualForm(
  a: ShoppingListItemFormValues,
  b: ShoppingListItemFormValues,
): boolean {
  return (
    a.name === b.name &&
    a.description === b.description &&
    a.quantity === b.quantity &&
    a.quantityUnit === b.quantityUnit &&
    sameUuids(a.shopIds, b.shopIds) &&
    a.categoryId === b.categoryId &&
    a.inventoryItemId === b.inventoryItemId
  )
}

const initialValues: ShoppingListItemFormValues = {
  name: '',
  description: '',
  quantity: undefined,
  quantityUnit: undefined,
  shopIds: [],
  categoryId: undefined,
  inventoryItemId: undefined,
}

export type SetShoppingListFormValue = <
  K extends keyof ShoppingListItemFormValues,
>(
  key: K,
  value: ShoppingListItemFormValues[K],
) => void

export const useShoppingListForm = (
  findInventoryItemById: (id: string) => InventoryItemView | undefined,
) => {
  const [fromInventory, setFromInventory] = useState<boolean>(false)
  const { selectedCategoryId, setSelectedCategoryId, clearSelectedCategory } =
    useCategorySelectionStore()
  const { selectedShopIds, setSelectedShopIds, clearSelectedShops } =
    useShopsSelectionStore()

  const [existingShoppingListItem, setExistingShoppingListItem] =
    useState<ShoppingListItemFormValues | null>(null)
  const [values, setValues] =
    useState<ShoppingListItemFormValues>(initialValues)

  const setValue: SetShoppingListFormValue = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  useEffect(() => {
    setValue('categoryId', selectedCategoryId ?? undefined)
  }, [selectedCategoryId, setValue])

  useEffect(() => {
    setValue('shopIds', selectedShopIds)
  }, [selectedShopIds, setValue])

  const setShoppingListItem = (shoppingListItem: ShoppingListItemView) => {
    const formValues = toShoppingListItemsFormValues(shoppingListItem)
    setValues(formValues)
    setExistingShoppingListItem(formValues)
    setSelectedCategoryId(shoppingListItem.categoryId)
    setSelectedShopIds(shoppingListItem.shopIds)
  }

  const linkInventoryItem = (
    inventoryItem: InventoryItemView,
    _fromInventory: boolean = false,
  ) => {
    setValue('inventoryItemId', inventoryItem.id)
    setValue('name', inventoryItem.name)
    setValue('description', inventoryItem.description ?? undefined)
    setValue('quantity', inventoryItem.targetStock ?? undefined)
    setValue('quantityUnit', inventoryItem.targetStockUnit ?? undefined)
    setSelectedCategoryId(inventoryItem.categoryId)
    setSelectedShopIds(inventoryItem.shopIds)
    setFromInventory(_fromInventory)
  }

  const unlinkInventoryItem = () => {
    setValue('inventoryItemId', undefined)
    setFromInventory(false)
  }

  const reset = () => {
    clearSelectedCategory()
    clearSelectedShops()
    setValues(initialValues)
    setExistingShoppingListItem(null)
  }

  const inventoryItem = useMemo(() => {
    if (!values.inventoryItemId) return undefined

    return findInventoryItemById(values.inventoryItemId)
  }, [findInventoryItemById, values.inventoryItemId])

  const isDirty = useMemo(() => {
    if (existingShoppingListItem) {
      return !shallowEqualForm(values, existingShoppingListItem)
    }

    if (inventoryItem) {
      if (fromInventory) {
        return true
      }

      const baseline = inventoryItemToFormValues(inventoryItem)
      return !shallowEqualForm(values, baseline)
    }

    // Reines neues Item
    return !shallowEqualForm(values, initialValues)
  }, [existingShoppingListItem, inventoryItem, values, fromInventory])

  const needsConfirmOnCancel = useMemo(() => {
    if (inventoryItem && fromInventory) {
      const baseline = inventoryItemToFormValues(inventoryItem)
      return !shallowEqualForm(values, baseline)
    }

    return isDirty
  }, [inventoryItem, fromInventory, values, isDirty])

  const isValid = useMemo(() => {
    if (!isDirty) return true

    const validation = shoppingListItemFormSchema.safeParse(values)
    return validation.success
  }, [values, isDirty])

  // Create-Fall mit verlinktem Inventory-Item

  return {
    setValue,
    setValues,
    values,
    isValid,
    isDirty,
    setShoppingListItem,
    reset,
    linkInventoryItem,
    unlinkInventoryItem,
    inventoryItem,
    needsConfirmOnCancel,
  }
}

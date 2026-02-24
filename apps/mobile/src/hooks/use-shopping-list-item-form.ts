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
  description: undefined,
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
  const { selectedCategoryId, setSelectedCategoryId, clearSelectedCategory } =
    useCategorySelectionStore()
  const { selectedShopIds, setSelectedShopIds, clearSelectedShops } =
    useShopsSelectionStore()

  const [existingItem, setExistingItem] =
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

  const setShoppingListItem = (item: ShoppingListItemView) => {
    const formValues = toShoppingListItemsFormValues(item)
    setValues(formValues)
    setExistingItem(formValues)
    setSelectedCategoryId(item.categoryId)
    setSelectedShopIds(item.shopIds)
  }

  const linkInventoryItem = (item: InventoryItemView) => {
    setValue('inventoryItemId', item.id)
    setValue('name', item.name)
    setValue('description', item.description ?? undefined)
    setValue('quantity', item.targetStock ?? undefined)
    setValue('quantityUnit', item.targetStockUnit ?? undefined)
    setSelectedCategoryId(item.categoryId)
    setSelectedShopIds(item.shopIds)
  }

  const unlinkInventoryItem = () => {
    setValue('inventoryItemId', undefined)
  }

  const reset = () => {
    clearSelectedCategory()
    clearSelectedShops()
    setValues(initialValues)
    setExistingItem(null)
  }

  const validation = shoppingListItemFormSchema.safeParse(values)
  const isValid = validation.success

  const inventoryItem = useMemo(() => {
    if (!values.inventoryItemId) return undefined

    return findInventoryItemById(values.inventoryItemId)
  }, [findInventoryItemById, values.inventoryItemId])

  const isDirty = useMemo(() => {
    if (existingItem) {
      return !shallowEqualForm(values, existingItem)
    } else {
      return !shallowEqualForm(values, initialValues)
    }
  }, [existingItem, values])

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
  }
}

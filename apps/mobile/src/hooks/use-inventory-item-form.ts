import {
  type AddInventoryItemInput,
  type EditInventoryItemInput,
  inventoryItemBaseFields,
} from '@glist/schemas'
import type { InventoryItemView } from '@glist/views'
import { useCallback, useEffect, useMemo, useState } from 'react'
import z from 'zod'
import { useCategorySelectionStore } from '@/stores/category-selection'
import { useShopsSelectionStore } from '@/stores/shops-selection'
import { sameUuids } from '@/utils/same-uuids'

export const inventoryItemFormSchema = z.object({
  name: inventoryItemBaseFields.name,
  description: inventoryItemBaseFields.description.optional(),
  categoryId: inventoryItemBaseFields.categoryId.optional(),
  targetStock: inventoryItemBaseFields.targetStock.optional(),
  targetStockUnit: inventoryItemBaseFields.targetStockUnit.optional(),
  basePriceCents: inventoryItemBaseFields.basePriceCents.optional(),
  basePriceUnit: inventoryItemBaseFields.basePriceUnit.optional(),
  shopIds: inventoryItemBaseFields.shopIds,
})

export type InventoryItemFormValues = z.infer<typeof inventoryItemFormSchema>

export function toAddInventoryItemInput(
  values: InventoryItemFormValues,
): AddInventoryItemInput {
  //TODO: Schema validieren
  return {
    name: values.name,
    description: values.description ?? null,
    categoryId: values.categoryId ?? null,
    targetStock: values.targetStock ?? null,
    targetStockUnit: values.targetStockUnit ?? null,
    basePriceCents: values.basePriceCents ?? null,
    basePriceUnit: values.basePriceUnit ?? null,
    shopIds: values.shopIds,
  }
}

export function toEditInventoryItemInput(
  values: InventoryItemFormValues,
): EditInventoryItemInput {
  //TODO: Schema validieren
  return {
    name: values.name,
    description: values.description?.trim() ?? null,
    categoryId: values.categoryId ?? null,
    targetStock: values.targetStock ?? null,
    targetStockUnit: values.targetStockUnit ?? null,
    basePriceCents: values.basePriceCents ?? null,
    basePriceUnit: values.basePriceUnit ?? null,
    shopIds: values.shopIds,
  }
}

export function toInventoryItemsFormValues(
  item: InventoryItemView,
): InventoryItemFormValues {
  return {
    name: item.name,
    description: item.description ?? undefined,
    shopIds: item.shopIds,
    categoryId: item.categoryId ?? undefined,
    targetStock: item.targetStock ?? undefined,
    targetStockUnit: item.targetStockUnit ?? undefined,
    basePriceCents: item.basePriceCents ?? undefined,
    basePriceUnit: item.basePriceUnit ?? undefined,
  }
}

function shallowEqualForm(
  a: InventoryItemFormValues,
  b: InventoryItemFormValues,
): boolean {
  console.log('!!!!!!', a.basePriceCents === b.basePriceCents)
  return (
    a.name === b.name &&
    a.description === b.description &&
    sameUuids(a.shopIds, b.shopIds) &&
    a.categoryId === b.categoryId &&
    a.targetStock === b.targetStock &&
    a.targetStockUnit === b.targetStockUnit &&
    a.basePriceCents === b.basePriceCents &&
    a.basePriceUnit === b.basePriceUnit
  )
}

const initialValues: InventoryItemFormValues = {
  name: '',
  description: undefined,
  shopIds: [],
  categoryId: undefined,
  targetStock: undefined,
  targetStockUnit: undefined,
  basePriceCents: undefined,
  basePriceUnit: undefined,
}

export type SetInventoryListItemFormValue = <
  K extends keyof InventoryItemFormValues,
>(
  key: K,
  value: InventoryItemFormValues[K],
) => void

export const useInventoryItemForm = () => {
  const { selectedCategoryId, setSelectedCategoryId, clearSelectedCategory } =
    useCategorySelectionStore()
  const { selectedShopIds, setSelectedShopIds, clearSelectedShops } =
    useShopsSelectionStore()

  const [existingItem, setExistingItem] =
    useState<InventoryItemFormValues | null>(null)
  const [values, setValues] = useState<InventoryItemFormValues>(initialValues)

  const setValue: SetInventoryListItemFormValue = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  useEffect(() => {
    setValue('categoryId', selectedCategoryId ?? undefined)
  }, [selectedCategoryId, setValue])

  useEffect(() => {
    setValue('shopIds', selectedShopIds)
  }, [selectedShopIds, setValue])

  const setInventoryItem = (item: InventoryItemView) => {
    const formValues = toInventoryItemsFormValues(item)
    setValues(formValues)
    setExistingItem(formValues)
    setSelectedCategoryId(item.categoryId)
    setSelectedShopIds(item.shopIds)
  }

  const reset = () => {
    clearSelectedCategory()
    clearSelectedShops()
    setValues(initialValues)
    setExistingItem(null)
  }

  const validation = inventoryItemFormSchema.safeParse(values)
  const isValid = validation.success

  if (!validation.success) {
    console.log('Validation errors:', validation.error)
  }
  console.log('Validation result:', isValid)

  const isDirty = useMemo(() => {
    if (existingItem) {
      return !shallowEqualForm(values, existingItem)
    } else {
      return !shallowEqualForm(values, initialValues)
    }
  }, [existingItem, values])

  console.log(values.basePriceCents)

  return {
    setValue,
    setValues,
    values,
    isValid,
    isDirty,
    setInventoryItem,
    reset,
  }
}

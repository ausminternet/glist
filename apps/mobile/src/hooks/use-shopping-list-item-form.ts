import {
  type AddShoppingListItemInput,
  shoppingListItemBaseFields,
  type UpdateShoppingListItemInput,
} from '@glist/schemas'
import type { ShoppingListItemView } from '@glist/views'
import { useMemo, useState } from 'react'
import z from 'zod'

export const shoppingListItemFormSchema = z.object({
  name: shoppingListItemBaseFields.name.optional(),
  description: shoppingListItemBaseFields.description.optional(),
  quantity: shoppingListItemBaseFields.quantity.optional(),
  quantityUnit: shoppingListItemBaseFields.quantityUnit.optional(),
})

export type ShoppingListItemFormValues = z.infer<
  typeof shoppingListItemFormSchema
>

export type SaveShoppingListItemArgs = {
  values: ShoppingListItemFormValues
  shopIds: string[]
  categoryId: string | null
  inventoryItemId?: string | null
}

export function toAddShoppingListItemInput({
  values,
  shopIds,
  categoryId,
  inventoryItemId,
}: SaveShoppingListItemArgs): AddShoppingListItemInput {
  if (!values.name || !values.name.trim()) {
    throw new Error('Name is required')
  }

  return {
    name: values.name,
    description: values.description ?? null,
    quantity: values.quantity ?? null,
    quantityUnit: values.quantityUnit ?? null,
    inventoryItemId: inventoryItemId ?? null,
    shopIds,
    categoryId,
  }
}

export function toUpdateShoppingListItemInput({
  values,
  shopIds,
  categoryId,
  inventoryItemId,
}: SaveShoppingListItemArgs): UpdateShoppingListItemInput {
  if (!values.name || !values.name.trim()) {
    throw new Error('Name is required')
  }

  return {
    name: values.name,
    description: values.description ?? null,
    quantity: values.quantity ?? null,
    quantityUnit: values.quantityUnit ?? null,
    inventoryItemId: inventoryItemId ?? null,
    shopIds,
    categoryId,
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
    a.quantityUnit === b.quantityUnit
  )
}

const initialValues: ShoppingListItemFormValues = {
  name: '',
  description: undefined,
  quantity: undefined,
  quantityUnit: undefined,
}

export type SetShoppingListFormValue = <
  K extends keyof ShoppingListItemFormValues,
>(
  key: K,
  value: ShoppingListItemFormValues[K],
) => void

export const useShoppingListForm = () => {
  const [existingItem, setExistingItem] =
    useState<ShoppingListItemFormValues | null>(null)
  const [values, setValues] =
    useState<ShoppingListItemFormValues>(initialValues)

  const setValue: SetShoppingListFormValue = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const setShoppingListItem = (item: ShoppingListItemView) => {
    const formValues = toShoppingListItemsFormValues(item)
    setValues(formValues)
    setExistingItem(formValues)
  }

  const reset = () => {
    setValues(initialValues)
    setExistingItem(null)
  }

  const validation = shoppingListItemFormSchema.safeParse(values)
  const isValid = validation.success

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
  }
}

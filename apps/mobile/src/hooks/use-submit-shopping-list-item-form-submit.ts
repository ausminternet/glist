import type {
  AddShoppingListItemInput,
  EditShoppingListItemInput,
} from '@glist/schemas'
import { err, ok, type Result } from '@glist/shared'
import { useState } from 'react'
import {
  useEditShoppingListItem,
  useSaveShoppingListItem,
} from '@/api/shopping-list-items'
import type { Snapshot } from '@/hooks/use-shopping-list-item-form'

type SubmitError =
  | { type: 'add'; error: Error }
  | { type: 'edit'; error: Error }
  | null

export function toAddShoppingListItemInput(
  values: Snapshot,
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
  values: Snapshot,
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

export function useSubmitShoppingListItemForm() {
  const { mutateAsync: addAsync } = useSaveShoppingListItem()
  const { mutateAsync: editAsync } = useEditShoppingListItem()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (
    values: Snapshot,
    shoppingListItemId?: string,
  ): Promise<Result<void, SubmitError>> => {
    setIsSubmitting(true)

    const isEdit = shoppingListItemId !== undefined

    try {
      if (isEdit) {
        await editAsync({
          itemId: shoppingListItemId,
          payload: toEditShoppingListItemInput(values),
        })
      } else {
        await addAsync(toAddShoppingListItemInput(values))
      }

      return ok(undefined)
    } catch (unknownError) {
      const error =
        unknownError instanceof Error
          ? unknownError
          : new Error('Unknown error')

      return err({
        type: isEdit ? 'edit' : 'add',
        error,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submit,
    isSubmitting,
  }
}

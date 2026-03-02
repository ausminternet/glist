import type {
  AddInventoryItemInput,
  EditInventoryItemInput,
} from '@glist/schemas'
import { err, ok, type Result } from '@glist/shared'
import { useState } from 'react'
import {
  useAddInventoryItem,
  useEditInventoryItem,
} from '@/api/inventory-items'
import type { Snapshot } from '@/hooks/use-inventory-item-form'

type SubmitError =
  | { type: 'add'; error: Error }
  | { type: 'edit'; error: Error }
  | null

export function toAddInventoryItemInput(
  values: Snapshot,
): AddInventoryItemInput {
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

export function toEditInventoryItemInput(
  values: Snapshot,
): EditInventoryItemInput {
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

export function useSubmitInventoryItemForm() {
  const { mutateAsync: addAsync } = useAddInventoryItem()
  const { mutateAsync: editAsync } = useEditInventoryItem()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (
    values: Snapshot,
    inventoryItemId?: string,
  ): Promise<Result<void, SubmitError>> => {
    setIsSubmitting(true)

    const isEdit = inventoryItemId !== undefined

    try {
      if (isEdit) {
        await editAsync({
          itemId: inventoryItemId,
          payload: toEditInventoryItemInput(values),
        })
      } else {
        await addAsync(toAddInventoryItemInput(values))
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

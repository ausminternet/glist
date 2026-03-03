import { inventoryItemBaseFields } from '@glist/schemas'

import { useEffect, useMemo, useRef, useState } from 'react'
import z from 'zod'
import { useInventoryItem } from '@/api/inventory-items'
import { useCategorySelectionStore } from '@/stores/category-selection'
import { useShopsSelectionStore } from '@/stores/shops-selection'
import { sameUuids } from '@/utils/same-uuids'

export const inventoryItemFormSchema = z.object({
  name: inventoryItemBaseFields.name,
  description: inventoryItemBaseFields.description.optional(),
  targetStock: inventoryItemBaseFields.targetStock.optional(),
  targetStockUnit: inventoryItemBaseFields.targetStockUnit.optional(),
  basePriceCents: inventoryItemBaseFields.basePriceCents.optional(),
  basePriceUnit: inventoryItemBaseFields.basePriceUnit.optional(),
  photoKeys: inventoryItemBaseFields.photoKeys,
})

export type FormPhoto = {
  key: string
  url: string
}

export type InventoryItemFormValues = Omit<
  z.infer<typeof inventoryItemFormSchema>,
  'photoKeys'
> & {
  photos: FormPhoto[]
}

export type Snapshot = InventoryItemFormValues & {
  categoryId: string | null
  shopIds: string[]
}

const emptyValues: InventoryItemFormValues = {
  name: '',
  description: undefined,
  targetStock: undefined,
  targetStockUnit: undefined,
  basePriceCents: undefined,
  basePriceUnit: undefined,
  photos: [],
}

export const useInventoryItemForm = (existingInventoryItemId?: string) => {
  const initializedRef = useRef(false)
  const isEditMode = !!existingInventoryItemId

  const [formValues, setFormValues] =
    useState<InventoryItemFormValues>(emptyValues)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)

  const { inventoryItem, isSuccess: isInventoryItemLoaded } = useInventoryItem(
    existingInventoryItemId,
  )

  const { selectedCategoryId, setSelectedCategoryId } =
    useCategorySelectionStore()
  const { selectedShopIds, setSelectedShopIds } = useShopsSelectionStore()

  useEffect(() => {
    if (initializedRef.current) return

    if (isEditMode) {
      if (!isInventoryItemLoaded || !inventoryItem) return

      initializedRef.current = true

      const snap: Snapshot = {
        name: inventoryItem.name,
        description: inventoryItem.description ?? undefined,
        targetStock: inventoryItem.targetStock ?? undefined,
        targetStockUnit: inventoryItem.targetStockUnit ?? undefined,
        basePriceCents: inventoryItem.basePriceCents ?? undefined,
        basePriceUnit: inventoryItem.basePriceUnit ?? undefined,
        categoryId: inventoryItem.categoryId,
        shopIds: inventoryItem.shopIds,
        photos: inventoryItem.photoKeys.map((key, index) => ({
          key,
          url: inventoryItem.photoUrls[index] ?? '',
        })),
      }

      setSnapshot(snap)
      setFormValues({
        name: snap.name,
        description: snap.description,
        targetStock: snap.targetStock,
        targetStockUnit: snap.targetStockUnit,
        basePriceCents: snap.basePriceCents,
        basePriceUnit: snap.basePriceUnit,
        photos: snap.photos,
      })
      setSelectedCategoryId(snap.categoryId)
      setSelectedShopIds(snap.shopIds)

      return
    }

    // CREATE EMPTY
    initializedRef.current = true

    const snap: Snapshot = {
      ...emptyValues,
      categoryId: null,
      shopIds: [],
    }

    setSnapshot(snap)
    setFormValues(emptyValues)
    setSelectedCategoryId(null)
    setSelectedShopIds([])
  }, [
    isEditMode,
    isInventoryItemLoaded,
    inventoryItem,
    setSelectedCategoryId,
    setSelectedShopIds,
  ])

  const current: Snapshot = useMemo(
    () => ({
      ...formValues,
      categoryId: selectedCategoryId,
      shopIds: selectedShopIds,
    }),
    [formValues, selectedCategoryId, selectedShopIds],
  )

  const isDirty = useMemo(() => {
    if (!snapshot) return false

    return (
      current.name !== snapshot.name ||
      current.description !== snapshot.description ||
      current.targetStock !== snapshot.targetStock ||
      current.targetStockUnit !== snapshot.targetStockUnit ||
      current.basePriceCents !== snapshot.basePriceCents ||
      current.basePriceUnit !== snapshot.basePriceUnit ||
      current.categoryId !== snapshot.categoryId ||
      !sameUuids(current.shopIds, snapshot.shopIds) ||
      !sameUuids(
        current.photos.map((p) => p.key),
        snapshot.photos.map((p) => p.key),
      )
    )
  }, [current, snapshot])

  const isValid = inventoryItemFormSchema.safeParse({
    ...formValues,
    photoKeys: formValues.photos.map((p) => p.key),
  }).success

  const canSubmit = isValid && (!isEditMode || isDirty)

  const commit = () => {
    setSnapshot(current)
  }

  return {
    values: current,
    setValue: <K extends keyof InventoryItemFormValues>(
      key: K,
      value: InventoryItemFormValues[K],
    ) => {
      setFormValues((prev) => ({ ...prev, [key]: value }))
    },
    commit,
    isDirty,
    canSubmit,
    inventoryItem,
  }
}

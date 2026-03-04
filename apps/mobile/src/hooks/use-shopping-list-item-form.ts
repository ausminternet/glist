import { shoppingListItemBaseFields } from '@glist/schemas'
import type { InventoryItemView } from '@glist/views'
import { useEffect, useMemo, useRef, useState } from 'react'
import z from 'zod'
import { useFindInventoryItems } from '@/api/inventory-items'
import { useShoppingListItem } from '@/api/shopping-list-items/use-shopping-list-item'
import { useCategorySelectionStore } from '@/stores/category-selection'
import { useShopsSelectionStore } from '@/stores/shops-selection'
import { sameUuids } from '@/utils/same-uuids'

export const shoppingListItemFormSchema = z.object({
  name: shoppingListItemBaseFields.name,
  description: shoppingListItemBaseFields.description.optional(),
  quantity: shoppingListItemBaseFields.quantity.optional(),
  quantityUnit: shoppingListItemBaseFields.quantityUnit.optional(),
  inventoryItemId: shoppingListItemBaseFields.inventoryItemId.optional(),
  photoKeys: shoppingListItemBaseFields.photoKeys,
})

export type FormPhoto = {
  key: string
  url: string
}

export type ShoppingListItemFormValues = Omit<
  z.infer<typeof shoppingListItemFormSchema>,
  'photoKeys'
> & {
  photos: FormPhoto[]
}

export type Snapshot = ShoppingListItemFormValues & {
  categoryId: string | null
  shopIds: string[]
}

const emptyValues: ShoppingListItemFormValues = {
  name: '',
  description: '',
  quantity: undefined,
  quantityUnit: undefined,
  inventoryItemId: undefined,
  photos: [],
}

export const useShoppingListForm = (
  existingShoppingListItemId?: string,
  fromInventoryItemId?: string,
) => {
  const initializedRef = useRef(false)
  const isEditMode = !!existingShoppingListItemId
  const [formValues, setFormValues] =
    useState<ShoppingListItemFormValues>(emptyValues)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)

  const { shoppingListItem, isSuccess: isShoppingListItemLoaded } =
    useShoppingListItem(existingShoppingListItemId)
  const { findInventoryItemById } = useFindInventoryItems()
  const { selectedCategoryId, setSelectedCategoryId } =
    useCategorySelectionStore()
  const { selectedShopIds, setSelectedShopIds } = useShopsSelectionStore()

  useEffect(() => {
    // 1. Wenn wir schon initialisiert haben, blocken wir hier JEDEN
    // weiteren Durchlauf. Das verhindert den Bug, dass Background-Refetches
    // das Formular überschreiben!
    if (initializedRef.current) return

    // EDIT
    if (isEditMode) {
      // Wenn die Daten noch nicht geladen sind, warten wir einfach auf
      // den nächsten Durchlauf des Effects.
      if (!isShoppingListItemLoaded || !shoppingListItem) return

      initializedRef.current = true

      const snapshot: Snapshot = {
        name: shoppingListItem.name,
        description: shoppingListItem.description ?? undefined,
        quantity: shoppingListItem.quantity ?? undefined,
        quantityUnit: shoppingListItem.quantityUnit ?? undefined,
        inventoryItemId: shoppingListItem.inventoryItemId ?? undefined,
        categoryId: shoppingListItem.categoryId,
        shopIds: shoppingListItem.shopIds,
        photos: shoppingListItem.photoKeys.map((key, index) => ({
          key,
          url: shoppingListItem.photoUrls[index] ?? '',
        })),
      }

      setSnapshot(snapshot)
      setFormValues({
        name: snapshot.name,
        description: snapshot.description,
        quantity: snapshot.quantity,
        quantityUnit: snapshot.quantityUnit,
        inventoryItemId: snapshot.inventoryItemId,
        photos: snapshot.photos,
      })
      setSelectedCategoryId(snapshot.categoryId)
      setSelectedShopIds(snapshot.shopIds)

      return
    }

    // CREATE FROM INVENTORY
    if (fromInventoryItemId) {
      const inventoryItem = findInventoryItemById(fromInventoryItemId)

      if (inventoryItem) {
        initializedRef.current = true

        const snap: Snapshot = {
          name: inventoryItem.name,
          description: inventoryItem.description ?? undefined,
          quantity: inventoryItem.targetStock ?? undefined,
          quantityUnit: inventoryItem.targetStockUnit ?? undefined,
          inventoryItemId: inventoryItem.id,
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
          quantity: snap.quantity,
          quantityUnit: snap.quantityUnit,
          inventoryItemId: snap.inventoryItemId,
          photos: snap.photos,
        })
        setSelectedCategoryId(snap.categoryId)
        setSelectedShopIds(snap.shopIds)
      }
      return
    }

    // CREATE EMPTY
    initializedRef.current = true

    const snapshot: Snapshot = {
      ...emptyValues,
      categoryId: null,
      shopIds: [],
    }

    setSnapshot(snapshot)
    setFormValues(emptyValues)
    setSelectedCategoryId(null)
    setSelectedShopIds([])
  }, [
    isEditMode,
    isShoppingListItemLoaded,
    shoppingListItem,
    fromInventoryItemId,
    findInventoryItemById,
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
      current.quantity !== snapshot.quantity ||
      current.quantityUnit !== snapshot.quantityUnit ||
      current.inventoryItemId !== snapshot.inventoryItemId ||
      current.categoryId !== snapshot.categoryId ||
      !sameUuids(current.shopIds, snapshot.shopIds) ||
      !sameUuids(
        current.photos.map((p) => p.key),
        snapshot.photos.map((p) => p.key),
      )
    )
  }, [current, snapshot])

  const isValid = shoppingListItemFormSchema.safeParse({
    ...formValues,
    photoKeys: formValues.photos.map((p) => p.key),
  }).success

  const canSubmit = isValid && (!isEditMode || isDirty)

  const linkInventoryItem = (item: InventoryItemView) => {
    setFormValues({
      name: item.name,
      description: item.description ?? undefined,
      quantity: item.targetStock ?? undefined,
      quantityUnit: item.targetStockUnit ?? undefined,
      inventoryItemId: item.id,
      photos: item.photoKeys.map((key, index) => ({
        key,
        url: item.photoUrls[index] ?? '',
      })),
    })

    setSelectedCategoryId(item.categoryId)
    setSelectedShopIds(item.shopIds)
  }

  const unlinkInventoryItem = () => {
    setFormValues((prev) => ({
      ...prev,
      inventoryItemId: undefined,
    }))
  }

  const commit = () => {
    setSnapshot(current)
  }

  const reset = () => {
    if (!snapshot) return

    setFormValues({
      name: snapshot.name,
      description: snapshot.description,
      quantity: snapshot.quantity,
      quantityUnit: snapshot.quantityUnit,
      inventoryItemId: snapshot.inventoryItemId,
      photos: snapshot.photos,
    })
    setSelectedCategoryId(snapshot.categoryId)
    setSelectedShopIds(snapshot.shopIds)
  }

  const inventoryItem = formValues.inventoryItemId
    ? findInventoryItemById(formValues.inventoryItemId)
    : undefined

  return {
    values: current,
    setValue: <K extends keyof ShoppingListItemFormValues>(
      key: K,
      value: ShoppingListItemFormValues[K],
    ) => {
      setFormValues((prev) => ({ ...prev, [key]: value }))
    },
    commit,
    isDirty,
    canSubmit,
    inventoryItem,
    linkInventoryItem,
    unlinkInventoryItem,
    shoppingListItem,
    reset,
  }
}
